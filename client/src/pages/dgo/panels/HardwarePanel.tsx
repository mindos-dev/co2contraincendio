/**
 * ─── Hardware Panel — Monitor de Infraestrutura do Host ─────────────────────
 * JULY AOG | OPERIS Command Center
 *
 * Disk Health: HD 1TB (WDC WD10PURX) em /media/aleixo/BACKUP_CO2/
 * AI Resource Monitor: RAM consumida pelos modelos Ollama
 * Temperatura e processamento do hardware
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";
import {
  HardDrive, Thermometer, MemoryStick, Cpu, Wifi,
  AlertTriangle, CheckCircle2, RefreshCw, Loader2,
  Database, Activity, Zap, Server
} from "lucide-react";

// ─── Gauge circular simples ───────────────────────────────────────────────────
function GaugeCard({
  label, value, max, unit, color, icon, warning, critical
}: {
  label: string; value: number; max: number; unit: string;
  color: string; icon: React.ReactNode; warning?: number; critical?: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const isCritical = critical && value >= critical;
  const isWarning = warning && value >= warning;
  const displayColor = isCritical ? "#ef4444" : isWarning ? "#f59e0b" : color;

  const data = [
    { value: pct, fill: displayColor },
    { value: 100 - pct, fill: "#27272a" },
  ];

  return (
    <div className={`bg-zinc-900/60 border rounded-xl p-4 text-center transition-all ${
      isCritical ? "border-red-500/40" : isWarning ? "border-yellow-500/30" : "border-zinc-800"
    }`}>
      <div className="relative h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={220}
              endAngle={-40}
              innerRadius="65%"
              outerRadius="85%"
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ color: displayColor }} className="text-lg font-bold">
            {typeof value === "number" ? value.toFixed(value > 10 ? 0 : 1) : value}
          </span>
          <span className="text-xs text-zinc-500">{unit}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <span style={{ color: displayColor }}>{icon}</span>
        <span className="text-xs text-zinc-400 font-medium">{label}</span>
        {isCritical && <AlertTriangle className="w-3 h-3 text-red-400" />}
      </div>
    </div>
  );
}

// ─── Barra de disco ───────────────────────────────────────────────────────────
function DiskBar({ disk }: { disk: any }) {
  const pct = disk.usePercent ?? 0;
  const isCritical = pct >= 90;
  const isWarning = pct >= 75;
  const barColor = isCritical ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-emerald-500";
  const isBackup = disk.mountpoint?.includes("BACKUP") || disk.mountpoint?.includes("media");

  return (
    <div className={`bg-zinc-900/60 border rounded-xl p-4 ${
      isCritical ? "border-red-500/30" : isWarning ? "border-yellow-500/20" : "border-zinc-800"
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isBackup ? "bg-amber-500/10" : "bg-blue-500/10"
        }`}>
          {isBackup
            ? <Database className="w-4 h-4 text-amber-400" />
            : <HardDrive className="w-4 h-4 text-blue-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-200 truncate">
              {disk.device?.split("/").pop() ?? disk.mountpoint}
            </span>
            {isBackup && (
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                BACKUP HD
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 truncate">{disk.mountpoint}</p>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold ${isCritical ? "text-red-400" : isWarning ? "text-yellow-400" : "text-zinc-200"}`}>
            {pct.toFixed(1)}%
          </div>
          <div className="text-xs text-zinc-600">usado</div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Total", value: disk.total ?? "—" },
          { label: "Usado", value: disk.used ?? "—" },
          { label: "Livre", value: disk.free ?? "—" },
        ].map(item => (
          <div key={item.label}>
            <div className="text-xs font-semibold text-zinc-300">{item.value}</div>
            <div className="text-xs text-zinc-600">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Painel Principal ─────────────────────────────────────────────────────────
export default function HardwarePanel() {
  const systemQuery = trpc.dgo.system.info.useQuery(undefined, { refetchInterval: 5_000 });
  const disksQuery = trpc.dgo.system.disks.useQuery(undefined, { refetchInterval: 15_000 });
  const tempQuery = trpc.dgo.system.temperature.useQuery(undefined, { refetchInterval: 8_000 });

  const sys = systemQuery.data as any;
  const disks = (disksQuery.data as any[]) ?? [];
  const temp = tempQuery.data as any;

  const isLoading = systemQuery.isLoading;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Monitor de Hardware
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Infraestrutura real do host · Atualização automática
          </p>
        </div>
        <button
          onClick={() => { systemQuery.refetch(); disksQuery.refetch(); tempQuery.refetch(); }}
          className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="ml-2 text-sm text-zinc-500">Lendo hardware do host...</span>
        </div>
      ) : (
        <>
          {/* Gauges de CPU, RAM e Temperatura */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <GaugeCard
              label="CPU"
              value={sys?.cpu?.usage ?? 0}
              max={100}
              unit="%"
              color="#22d3ee"
              icon={<Cpu className="w-3.5 h-3.5" />}
              warning={70}
              critical={90}
            />
            <GaugeCard
              label="RAM"
              value={sys?.memory?.usedGB ?? 0}
              max={sys?.memory?.totalGB ?? 16}
              unit="GB"
              color="#a855f7"
              icon={<MemoryStick className="w-3.5 h-3.5" />}
              warning={12}
              critical={15}
            />
            <GaugeCard
              label="Temperatura"
              value={temp?.cpu ?? 0}
              max={100}
              unit="°C"
              color="#f97316"
              icon={<Thermometer className="w-3.5 h-3.5" />}
              warning={70}
              critical={85}
            />
            <GaugeCard
              label="Swap"
              value={sys?.memory?.swapUsedGB ?? 0}
              max={sys?.memory?.swapTotalGB ?? 4}
              unit="GB"
              color="#10b981"
              icon={<Activity className="w-3.5 h-3.5" />}
              warning={2}
              critical={3.5}
            />
          </div>

          {/* Info do sistema */}
          {sys && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300">Sistema</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: "OS", value: sys.os?.distro ?? "Linux" },
                  { label: "Kernel", value: sys.os?.kernel?.split("-")[0] ?? "—" },
                  { label: "Uptime", value: sys.uptime ?? "—" },
                  { label: "Processos", value: sys.processes ?? "—" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-xs font-semibold text-zinc-300 truncate">{item.value}</div>
                    <div className="text-xs text-zinc-600">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discos */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Armazenamento
            </h3>
            {disks.length === 0 ? (
              <div className="text-center py-6 text-zinc-600">
                <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum disco detectado.</p>
                <p className="text-xs mt-1">Verifique os volumes montados no container.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {disks.map((disk: any, i: number) => (
                  <DiskBar key={i} disk={disk} />
                ))}
              </div>
            )}
          </div>

          {/* Temperaturas detalhadas */}
          {temp && Object.keys(temp).length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                Temperaturas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(temp).map(([key, val]: [string, any]) => {
                  const v = typeof val === "number" ? val : val?.main ?? 0;
                  const isCrit = v >= 85;
                  const isWarn = v >= 70;
                  return (
                    <div key={key} className={`text-center p-2 rounded-lg ${
                      isCrit ? "bg-red-500/10" : isWarn ? "bg-yellow-500/10" : "bg-zinc-800/50"
                    }`}>
                      <div className={`text-sm font-bold ${
                        isCrit ? "text-red-400" : isWarn ? "text-yellow-400" : "text-zinc-300"
                      }`}>
                        {v.toFixed(0)}°C
                      </div>
                      <div className="text-xs text-zinc-600 capitalize">{key}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
