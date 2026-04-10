/**
 * ─── System Service — Monitor de Hardware do Host ────────────────────────────
 * JULY AOG | OPERIS IA
 * Leitura de CPU, RAM, Disco, Temperatura via /proc e /sys do host
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface DiskPartition {
  device: string;
  mountpoint: string;
  label: string;
  totalGB: number;
  usedGB: number;
  freeGB: number;
  usedPercent: number;
  type: "ssd" | "hdd" | "backup" | "system" | "unknown";
  isBackup: boolean;
}

export interface DiskUsage {
  partitions: DiskPartition[];
  totalSystemGB: number;
  totalBackupGB: number;
  checkedAt: string;
}

export interface HardwareStats {
  cpuPercent: number;
  cpuCores: number;
  cpuModel: string;
  ramUsedGB: number;
  ramTotalGB: number;
  ramPercent: number;
  swapUsedGB: number;
  swapTotalGB: number;
  uptimeSeconds: number;
  uptimeFormatted: string;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
  checkedAt: string;
}

export interface TemperatureSensor {
  name: string;
  label: string;
  tempCelsius: number;
  maxCelsius: number;
  criticalCelsius: number;
  status: "ok" | "warm" | "hot" | "critical";
}

export interface TemperatureReport {
  sensors: TemperatureSensor[];
  available: boolean;
  cpuMaxTemp: number | null;
  gpuTemp: number | null;
  checkedAt: string;
}

// ─── Uso de Disco ─────────────────────────────────────────────────────────────
export async function getDiskUsage(): Promise<DiskUsage> {
  const { stdout } = await execAsync(
    "df -BG --output=source,target,size,used,avail,pcent 2>/dev/null | tail -n +2",
    { timeout: 10_000 }
  );

  const partitions: DiskPartition[] = [];

  for (const line of stdout.trim().split("\n")) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 6) continue;

    const [device, mountpoint, sizeRaw, usedRaw, freeRaw, percentRaw] = parts;

    // Filtrar partições irrelevantes
    const skip = ["/dev/loop", "tmpfs", "udev", "devtmpfs", "overlay", "shm"];
    if (skip.some(s => device.startsWith(s))) continue;

    const totalGB = parseFloat(sizeRaw.replace("G", "")) || 0;
    const usedGB = parseFloat(usedRaw.replace("G", "")) || 0;
    const freeGB = parseFloat(freeRaw.replace("G", "")) || 0;
    const usedPercent = parseInt(percentRaw.replace("%", "")) || 0;

    const isBackup = mountpoint.includes("BACKUP") || mountpoint.includes("backup");
    const isSSD = device.includes("nvme") || device.includes("sda");
    const isHDD = device.includes("sdb") || device.includes("sdc") || device.includes("hd");

    let type: DiskPartition["type"] = "unknown";
    if (isBackup) type = "backup";
    else if (mountpoint === "/") type = "system";
    else if (isSSD) type = "ssd";
    else if (isHDD) type = "hdd";

    let label = mountpoint;
    if (mountpoint === "/") label = "Sistema (SSD)";
    else if (isBackup) label = "HD Backup CO₂ (1TB)";
    else if (mountpoint.startsWith("/home")) label = "Home";
    else if (mountpoint.startsWith("/media")) label = mountpoint.split("/").pop() ?? mountpoint;

    partitions.push({
      device,
      mountpoint,
      label,
      totalGB: Math.round(totalGB * 10) / 10,
      usedGB: Math.round(usedGB * 10) / 10,
      freeGB: Math.round(freeGB * 10) / 10,
      usedPercent,
      type,
      isBackup,
    });
  }

  const systemPart = partitions.find(p => p.mountpoint === "/");
  const backupPart = partitions.find(p => p.isBackup);

  return {
    partitions,
    totalSystemGB: systemPart?.totalGB ?? 0,
    totalBackupGB: backupPart?.totalGB ?? 0,
    checkedAt: new Date().toISOString(),
  };
}

// ─── Hardware Stats (CPU, RAM, Uptime) ───────────────────────────────────────
export async function getHardwareStats(): Promise<HardwareStats> {
  // CPU model
  let cpuModel = "Desconhecido";
  try {
    const { stdout } = await execAsync(
      "grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2",
      { timeout: 5_000 }
    );
    cpuModel = stdout.trim();
  } catch {}

  // CPU cores
  let cpuCores = 1;
  try {
    const { stdout } = await execAsync("nproc", { timeout: 3_000 });
    cpuCores = parseInt(stdout.trim()) || 1;
  } catch {}

  // CPU usage (via /proc/stat — dois samples de 500ms)
  let cpuPercent = 0;
  try {
    const readCpuStat = async () => {
      const data = await fs.readFile("/proc/stat", "utf8");
      const line = data.split("\n")[0];
      const vals = line.split(/\s+/).slice(1).map(Number);
      const idle = vals[3] + vals[4]; // idle + iowait
      const total = vals.reduce((a, b) => a + b, 0);
      return { idle, total };
    };
    const s1 = await readCpuStat();
    await new Promise(r => setTimeout(r, 500));
    const s2 = await readCpuStat();
    const idleDiff = s2.idle - s1.idle;
    const totalDiff = s2.total - s1.total;
    cpuPercent = totalDiff > 0 ? Math.round(((totalDiff - idleDiff) / totalDiff) * 100 * 10) / 10 : 0;
  } catch {
    try {
      const { stdout } = await execAsync(
        "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1",
        { timeout: 5_000 }
      );
      cpuPercent = parseFloat(stdout.trim()) || 0;
    } catch {}
  }

  // RAM via /proc/meminfo
  let ramTotalGB = 0, ramUsedGB = 0, swapTotalGB = 0, swapUsedGB = 0;
  try {
    const memInfo = await fs.readFile("/proc/meminfo", "utf8");
    const parse = (key: string) => {
      const match = memInfo.match(new RegExp(`${key}:\\s+(\\d+)`));
      return match ? parseInt(match[1]) * 1024 : 0; // kB → bytes
    };
    const memTotal = parse("MemTotal");
    const memAvail = parse("MemAvailable");
    const swapTotal = parse("SwapTotal");
    const swapFree = parse("SwapFree");
    ramTotalGB = Math.round((memTotal / 1024 / 1024 / 1024) * 10) / 10;
    ramUsedGB = Math.round(((memTotal - memAvail) / 1024 / 1024 / 1024) * 10) / 10;
    swapTotalGB = Math.round((swapTotal / 1024 / 1024 / 1024) * 10) / 10;
    swapUsedGB = Math.round(((swapTotal - swapFree) / 1024 / 1024 / 1024) * 10) / 10;
  } catch {}

  // Uptime e load average via /proc/uptime e /proc/loadavg
  let uptimeSeconds = 0;
  let loadAvg1 = 0, loadAvg5 = 0, loadAvg15 = 0;
  try {
    const [uptimeData, loadData] = await Promise.all([
      fs.readFile("/proc/uptime", "utf8"),
      fs.readFile("/proc/loadavg", "utf8"),
    ]);
    uptimeSeconds = Math.floor(parseFloat(uptimeData.split(" ")[0]));
    const loads = loadData.split(" ");
    loadAvg1 = parseFloat(loads[0]);
    loadAvg5 = parseFloat(loads[1]);
    loadAvg15 = parseFloat(loads[2]);
  } catch {}

  const ramPercent = ramTotalGB > 0 ? Math.round((ramUsedGB / ramTotalGB) * 100 * 10) / 10 : 0;

  return {
    cpuPercent,
    cpuCores,
    cpuModel,
    ramUsedGB,
    ramTotalGB,
    ramPercent,
    swapUsedGB,
    swapTotalGB,
    uptimeSeconds,
    uptimeFormatted: formatUptime(uptimeSeconds),
    loadAvg1: Math.round(loadAvg1 * 100) / 100,
    loadAvg5: Math.round(loadAvg5 * 100) / 100,
    loadAvg15: Math.round(loadAvg15 * 100) / 100,
    checkedAt: new Date().toISOString(),
  };
}

// ─── Temperatura dos sensores ─────────────────────────────────────────────────
export async function getTemperature(): Promise<TemperatureReport> {
  const sensors: TemperatureSensor[] = [];
  let cpuMaxTemp: number | null = null;
  let gpuTemp: number | null = null;

  // Tentar via /sys/class/thermal (funciona em qualquer Linux)
  try {
    const thermalBase = "/sys/class/thermal";
    const zones = await fs.readdir(thermalBase).catch(() => [] as string[]);

    for (const zone of zones.filter(z => z.startsWith("thermal_zone"))) {
      try {
        const [tempRaw, typeRaw] = await Promise.all([
          fs.readFile(`${thermalBase}/${zone}/temp`, "utf8"),
          fs.readFile(`${thermalBase}/${zone}/type`, "utf8"),
        ]);
        const tempC = parseInt(tempRaw.trim()) / 1000;
        const type = typeRaw.trim();

        if (isNaN(tempC) || tempC <= 0 || tempC > 150) continue;

        const status: TemperatureSensor["status"] =
          tempC >= 90 ? "critical" :
          tempC >= 75 ? "hot" :
          tempC >= 60 ? "warm" : "ok";

        sensors.push({
          name: zone,
          label: formatThermalLabel(type),
          tempCelsius: Math.round(tempC * 10) / 10,
          maxCelsius: 100,
          criticalCelsius: 105,
          status,
        });

        if (type.includes("cpu") || type.includes("x86_pkg")) {
          cpuMaxTemp = Math.max(cpuMaxTemp ?? 0, tempC);
        }
      } catch {}
    }
  } catch {}

  // Tentar GPU NVIDIA via nvidia-smi
  try {
    const { stdout } = await execAsync(
      "nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader,nounits 2>/dev/null",
      { timeout: 5_000 }
    );
    const temp = parseFloat(stdout.trim());
    if (!isNaN(temp) && temp > 0) {
      gpuTemp = temp;
      const status: TemperatureSensor["status"] =
        temp >= 85 ? "critical" : temp >= 70 ? "hot" : temp >= 55 ? "warm" : "ok";
      sensors.push({
        name: "gpu-nvidia",
        label: "GPU NVIDIA",
        tempCelsius: temp,
        maxCelsius: 95,
        criticalCelsius: 100,
        status,
      });
    }
  } catch {}

  return {
    sensors,
    available: sensors.length > 0,
    cpuMaxTemp: cpuMaxTemp ? Math.round(cpuMaxTemp * 10) / 10 : null,
    gpuTemp,
    checkedAt: new Date().toISOString(),
  };
}

// ─── Utilitários ──────────────────────────────────────────────────────────────
function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatThermalLabel(type: string): string {
  const map: Record<string, string> = {
    "x86_pkg_temp": "CPU Package",
    "cpu-thermal": "CPU Thermal",
    "acpitz": "ACPI Thermal",
    "nvme": "NVMe SSD",
    "pch_skylake": "PCH",
    "iwlwifi_1": "Wi-Fi",
    "INT3400 Thermal": "DPTF",
  };
  return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
