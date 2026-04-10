/**
 * ─── Docker Service — Leitura via /var/run/docker.sock ───────────────────────
 * Comunicação direta com o Docker daemon via Unix socket.
 * Não requer docker CLI instalado no container — usa HTTP sobre socket.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import http from "http";

const DOCKER_SOCKET = process.env.DOCKER_SOCKET_PATH ?? "/var/run/docker.sock";
const DOCKER_API_VERSION = "v1.43";

// ─── Utilitário: requisição HTTP via Unix socket ──────────────────────────────
function dockerRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const options: http.RequestOptions = {
      socketPath: DOCKER_SOCKET,
      path: `/${DOCKER_API_VERSION}${path}`,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(data ? JSON.parse(data) : { status: res.statusCode });
        } catch {
          resolve({ raw: data, status: res.statusCode });
        }
      });
    });

    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: "running" | "exited" | "paused" | "restarting" | "dead" | "created" | "removing";
  state: string;
  created: number;
  ports: Array<{ hostPort: number; containerPort: number; protocol: string }>;
  labels: Record<string, string>;
  uptime: string;
}

export interface ContainerStats {
  id: string;
  name: string;
  cpuPercent: number;
  memUsageMB: number;
  memLimitMB: number;
  memPercent: number;
  networkRxMB: number;
  networkTxMB: number;
  blockReadMB: number;
  blockWriteMB: number;
  pids: number;
  timestamp: string;
}

// ─── Listar containers ────────────────────────────────────────────────────────
export async function listContainers(): Promise<ContainerInfo[]> {
  const raw = await dockerRequest("GET", "/containers/json?all=true") as any[];

  return raw.map((c: any) => {
    const ports = (c.Ports ?? []).map((p: any) => ({
      hostPort: p.PublicPort ?? 0,
      containerPort: p.PrivatePort ?? 0,
      protocol: p.Type ?? "tcp",
    }));

    // Calcular uptime
    const created = c.Created ?? 0;
    const uptimeSec = Math.floor(Date.now() / 1000) - created;
    const uptime = formatUptime(uptimeSec);

    const state = (c.State ?? "").toLowerCase() as ContainerInfo["status"];

    return {
      id: c.Id?.slice(0, 12) ?? "",
      name: (c.Names?.[0] ?? "").replace(/^\//, ""),
      image: c.Image ?? "",
      status: state,
      state: c.Status ?? "",
      created,
      ports,
      labels: c.Labels ?? {},
      uptime,
    };
  });
}

// ─── Estatísticas de um container ─────────────────────────────────────────────
export async function getContainerStats(containerId: string): Promise<ContainerStats> {
  const raw = await dockerRequest(
    "GET",
    `/containers/${containerId}/stats?stream=false`
  ) as any;

  // Cálculo de CPU%
  const cpuDelta =
    (raw.cpu_stats?.cpu_usage?.total_usage ?? 0) -
    (raw.precpu_stats?.cpu_usage?.total_usage ?? 0);
  const systemDelta =
    (raw.cpu_stats?.system_cpu_usage ?? 0) -
    (raw.precpu_stats?.system_cpu_usage ?? 0);
  const numCpus = raw.cpu_stats?.online_cpus ?? 1;
  const cpuPercent =
    systemDelta > 0 ? (cpuDelta / systemDelta) * numCpus * 100 : 0;

  // Memória
  const memUsage = raw.memory_stats?.usage ?? 0;
  const memCache = raw.memory_stats?.stats?.cache ?? 0;
  const memLimit = raw.memory_stats?.limit ?? 1;
  const memUsageMB = (memUsage - memCache) / 1024 / 1024;
  const memLimitMB = memLimit / 1024 / 1024;
  const memPercent = (memUsageMB / memLimitMB) * 100;

  // Rede
  const networks = raw.networks ?? {};
  let rxBytes = 0;
  let txBytes = 0;
  for (const net of Object.values(networks) as any[]) {
    rxBytes += net.rx_bytes ?? 0;
    txBytes += net.tx_bytes ?? 0;
  }

  // Disco I/O
  const blkStats = raw.blkio_stats?.io_service_bytes_recursive ?? [];
  let blockRead = 0;
  let blockWrite = 0;
  for (const blk of blkStats) {
    if (blk.op === "Read") blockRead += blk.value ?? 0;
    if (blk.op === "Write") blockWrite += blk.value ?? 0;
  }

  return {
    id: containerId,
    name: raw.name?.replace(/^\//, "") ?? containerId,
    cpuPercent: Math.round(cpuPercent * 100) / 100,
    memUsageMB: Math.round(memUsageMB * 10) / 10,
    memLimitMB: Math.round(memLimitMB * 10) / 10,
    memPercent: Math.round(memPercent * 10) / 10,
    networkRxMB: Math.round((rxBytes / 1024 / 1024) * 100) / 100,
    networkTxMB: Math.round((txBytes / 1024 / 1024) * 100) / 100,
    blockReadMB: Math.round((blockRead / 1024 / 1024) * 100) / 100,
    blockWriteMB: Math.round((blockWrite / 1024 / 1024) * 100) / 100,
    pids: raw.pids_stats?.current ?? 0,
    timestamp: new Date().toISOString(),
  };
}

// ─── Logs de um container ─────────────────────────────────────────────────────
export async function getContainerLogs(
  containerId: string,
  tail: number = 100
): Promise<{ lines: string[]; containerId: string; timestamp: string }> {
  return new Promise((resolve, reject) => {
    const options: http.RequestOptions = {
      socketPath: DOCKER_SOCKET,
      path: `/${DOCKER_API_VERSION}/containers/${containerId}/logs?stdout=true&stderr=true&tail=${tail}&timestamps=true`,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        const raw = Buffer.concat(chunks);
        const lines: string[] = [];
        let offset = 0;

        // Docker multiplexed stream format: 8-byte header + payload
        while (offset < raw.length) {
          if (offset + 8 > raw.length) break;
          const size = raw.readUInt32BE(offset + 4);
          offset += 8;
          if (offset + size > raw.length) break;
          const line = raw.slice(offset, offset + size).toString("utf8").trimEnd();
          if (line) lines.push(line);
          offset += size;
        }

        resolve({ lines, containerId, timestamp: new Date().toISOString() });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

// ─── Controlar container ──────────────────────────────────────────────────────
export async function controlContainer(
  containerId: string,
  action: "start" | "stop" | "restart" | "pause" | "unpause"
): Promise<void> {
  await dockerRequest("POST", `/containers/${containerId}/${action}`);
}

// ─── Informações gerais do Docker daemon ──────────────────────────────────────
export interface DockerInfo {
  version: string;
  apiVersion: string;
  os: string;
  arch: string;
  kernelVersion: string;
  totalContainers: number;
  runningContainers: number;
  pausedContainers: number;
  stoppedContainers: number;
  totalImages: number;
  memTotal: number;
  cpus: number;
  serverTime: string;
}

export async function getDockerInfo(): Promise<DockerInfo> {
  const [info, version] = await Promise.all([
    dockerRequest("GET", "/info") as Promise<any>,
    dockerRequest("GET", "/version") as Promise<any>,
  ]);

  return {
    version: version.Version ?? "unknown",
    apiVersion: version.ApiVersion ?? "unknown",
    os: info.OperatingSystem ?? "Linux",
    arch: info.Architecture ?? "x86_64",
    kernelVersion: info.KernelVersion ?? "unknown",
    totalContainers: info.Containers ?? 0,
    runningContainers: info.ContainersRunning ?? 0,
    pausedContainers: info.ContainersPaused ?? 0,
    stoppedContainers: info.ContainersStopped ?? 0,
    totalImages: info.Images ?? 0,
    memTotal: Math.round((info.MemTotal ?? 0) / 1024 / 1024),
    cpus: info.NCPU ?? 0,
    serverTime: new Date().toISOString(),
  };
}

// ─── Utilitário: formatar uptime ──────────────────────────────────────────────
function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}
