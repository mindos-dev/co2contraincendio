/**
 * ─── D.G.O. — Dashboard de Governança e Operação ────────────────────────────
 * OPERIS IA | JULY AOG — Engenharia Soberana
 *
 * Módulos:
 *  1. Docker Monitor  — leitura em tempo real via /var/run/docker.sock
 *  2. Shell Bridge    — execução segura com whitelist de comandos
 *  3. System Monitor  — CPU, RAM, Disco, Temperatura do host
 *  4. Ollama Manager  — controle de múltiplos modelos de IA open source
 *  5. AI Pipeline     — fluxos encadeados entre múltiplas IAs para testes
 *  6. AI Alerts       — alertas inteligentes de saúde das IAs
 *  7. Project Tasks   — Kanban Board, Burnup e OPERIS Engines
 *  8. Web Search      — busca web com resumo por IA local (Gemma 2)
 *  9. Governance      — logs de auditoria e controle de governança
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { TRPCError } from "@trpc/server";
import { serviceManagerRouter } from "./service-manager-router";
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import {
  listContainers,
  getContainerStats,
  getContainerLogs,
  controlContainer,
  getDockerInfo,
} from "./docker-service";
import {
  executeShellCommand,
  ALLOWED_COMMANDS,
} from "./shell-bridge";
import {
  getDiskUsage,
  getHardwareStats,
  getTemperature,
} from "./system-service";
import {
  listOllamaModels,
  getOllamaRunningModel,
  switchOllamaModel,
  pullOllamaModel,
  getOllamaStatus,
  deleteOllamaModel,
  MODEL_CATALOG,
} from "./ollama-service";
import {
  executePipeline,
  PRESET_PIPELINES,
  PipelineSchema,
  getActiveAlerts,
  getAllAlerts,
  resolveAlert,
  checkAIHealth,
  createAlert,
} from "./ai-pipeline";
import {
  getAllTasks,
  getKanbanBoard,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  getBurnupMetrics,
  getOperisEngines,
  getProjectStats,
  parseTodoMd,
} from "./project-service";
import { webSearch } from "./web-search-service";

const dgoProcedure = publicProcedure;

// ─── Log de Governança em memória ─────────────────────────────────────────────
interface GovernanceLog {
  id: string;
  timestamp: string;
  action: string;
  module: "docker" | "shell" | "ollama" | "pipeline" | "system" | "project" | "search";
  detail: string;
  status: "success" | "error" | "blocked";
}
const governanceLogs: GovernanceLog[] = [];

function logGovernance(
  action: string,
  module: GovernanceLog["module"],
  detail: string,
  status: GovernanceLog["status"] = "success"
) {
  const entry: GovernanceLog = {
    id: `gov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    action, module, detail, status,
  };
  governanceLogs.unshift(entry);
  if (governanceLogs.length > 500) governanceLogs.splice(500);
  return entry;
}

// ─── Router Principal ─────────────────────────────────────────────────────────
export const dgoRouter = router({

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DOCKER MONITOR
  // ══════════════════════════════════════════════════════════════════════════
  docker: router({
    list: dgoProcedure.query(async () => {
      try { return await listContainers(); }
      catch (e) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Docker Socket inacessível: ${(e as Error).message}` }); }
    }),

    stats: dgoProcedure
      .input(z.object({ containerId: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        try { return await getContainerStats(input.containerId); }
        catch (e) { throw new TRPCError({ code: "NOT_FOUND", message: `Container não encontrado: ${input.containerId}` }); }
      }),

    logs: dgoProcedure
      .input(z.object({
        containerId: z.string().min(1).max(64),
        tail: z.number().min(10).max(500).default(100),
      }))
      .query(async ({ input }) => {
        try { return await getContainerLogs(input.containerId, input.tail); }
        catch (e) { throw new TRPCError({ code: "NOT_FOUND", message: `Logs indisponíveis: ${(e as Error).message}` }); }
      }),

    control: dgoProcedure
      .input(z.object({
        containerId: z.string().min(1).max(64),
        action: z.enum(["start", "stop", "restart", "pause", "unpause"]),
      }))
      .mutation(async ({ input }) => {
        logGovernance(`container.${input.action}`, "docker", `Container: ${input.containerId}`);
        try {
          await controlContainer(input.containerId, input.action);
          return { success: true, containerId: input.containerId, action: input.action, timestamp: new Date().toISOString() };
        } catch (e) {
          logGovernance(`container.${input.action}`, "docker", (e as Error).message, "error");
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Falha: ${(e as Error).message}` });
        }
      }),

    info: dgoProcedure.query(async () => {
      try { return await getDockerInfo(); }
      catch (e) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Docker info: ${(e as Error).message}` }); }
    }),
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // 2. SHELL BRIDGE
  // ══════════════════════════════════════════════════════════════════════════
  shell: router({
    allowedCommands: dgoProcedure.query(() =>
      ALLOWED_COMMANDS.map(cmd => ({
        id: cmd.id, label: cmd.label, description: cmd.description,
        category: cmd.category, dangerous: cmd.dangerous ?? false,
      }))
    ),

    execute: dgoProcedure
      .input(z.object({
        commandId: z.string().min(1).max(80),
        args: z.array(z.string().max(200)).max(5).optional().default([]),
      }))
      .mutation(async ({ input }) => {
        logGovernance("shell.execute", "shell", `Comando: ${input.commandId} | Args: ${input.args.join(" ")}`);
        try {
          const result = await executeShellCommand(input.commandId, input.args);
          return { success: true, output: result.stdout, stderr: result.stderr, exitCode: result.exitCode, commandId: input.commandId, executedAt: new Date().toISOString() };
        } catch (e) {
          logGovernance("shell.execute", "shell", `BLOQUEADO: ${input.commandId}`, "blocked");
          throw new TRPCError({ code: "FORBIDDEN", message: `Comando bloqueado: ${(e as Error).message}` });
        }
      }),
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SYSTEM MONITOR
  // ══════════════════════════════════════════════════════════════════════════
  system: router({
    disk: dgoProcedure.query(async () => {
      try { return await getDiskUsage(); }
      catch (e) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Disco: ${(e as Error).message}` }); }
    }),

    hardware: dgoProcedure.query(async () => {
      try { return await getHardwareStats(); }
      catch (e) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Hardware: ${(e as Error).message}` }); }
    }),

    temperature: dgoProcedure.query(async () => {
      try { return await getTemperature(); }
      catch { return { sensors: [], available: false, cpuMaxTemp: null, gpuTemp: null, checkedAt: new Date().toISOString() }; }
    }),

    snapshot: dgoProcedure.query(async () => {
      const [hardware, disk, temperature] = await Promise.allSettled([
        getHardwareStats(), getDiskUsage(), getTemperature(),
      ]);
      return {
        hardware: hardware.status === "fulfilled" ? hardware.value : null,
        disk: disk.status === "fulfilled" ? disk.value : null,
        temperature: temperature.status === "fulfilled" ? temperature.value : null,
        timestamp: new Date().toISOString(),
      };
    }),
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // 4. OLLAMA — Controle de Múltiplas IAs
  // ══════════════════════════════════════════════════════════════════════════
  ollama: router({
    status: dgoProcedure.query(async () => getOllamaStatus()),
    models: dgoProcedure.query(async () => {
      try { return await listOllamaModels(); }
      catch (e) { throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: `Ollama: ${(e as Error).message}` }); }
    }),
    catalog: dgoProcedure.query(() =>
      Object.entries(MODEL_CATALOG).map(([name, info]) => ({ name, ...info }))
    ),
    running: dgoProcedure.query(async () => {
      try { return await getOllamaRunningModel(); }
      catch { return { model: null, displayName: null, expiresAt: null, sizeVRAM: 0, available: false }; }
    }),
    switchModel: dgoProcedure
      .input(z.object({ modelName: z.string().min(1).max(100) }))
      .mutation(async ({ input }) => {
        logGovernance("ollama.switch", "ollama", `Trocando para: ${input.modelName}`);
        try {
          const result = await switchOllamaModel(input.modelName);
          return { success: true, model: input.modelName, ...result };
        } catch (e) {
          logGovernance("ollama.switch", "ollama", (e as Error).message, "error");
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Falha ao trocar modelo: ${(e as Error).message}` });
        }
      }),
    pull: dgoProcedure
      .input(z.object({ modelName: z.string().min(1).max(100) }))
      .mutation(async ({ input }) => {
        logGovernance("ollama.pull", "ollama", `Pull: ${input.modelName}`);
        try { return await pullOllamaModel(input.modelName); }
        catch (e) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Pull falhou: ${(e as Error).message}` }); }
      }),
    delete: dgoProcedure
      .input(z.object({ modelName: z.string().min(1).max(100) }))
      .mutation(async ({ input }) => {
        logGovernance("ollama.delete", "ollama", `Deletando: ${input.modelName}`);
        try { await deleteOllamaModel(input.modelName); return { success: true, deleted: input.modelName }; }
        catch (e) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Remoção falhou: ${(e as Error).message}` }); }
      }),
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // 5. AI PIPELINE
  // ══════════════════════════════════════════════════════════════════════════
  pipeline: router({
    presets: dgoProcedure.query(() =>
      PRESET_PIPELINES.map((p, i) => ({ id: `preset-${i}`, ...p }))
    ),
    execute: dgoProcedure
      .input(PipelineSchema)
      .mutation(async ({ input }) => {
        logGovernance("pipeline.execute", "pipeline", `"${input.name}" | ${input.steps.map(s => s.model).join(" → ")}`);
        try {
          const result = await executePipeline(input);
          logGovernance("pipeline.complete", "pipeline", `Status: ${result.status} | ${(result.totalDurationMs / 1000).toFixed(1)}s`);
          return result;
        } catch (e) {
          logGovernance("pipeline.execute", "pipeline", (e as Error).message, "error");
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Pipeline falhou: ${(e as Error).message}` });
        }
      }),
    runPreset: dgoProcedure
      .input(z.object({
        presetIndex: z.number().min(0).max(20),
        initialPrompt: z.string().min(1).max(10_000),
        overrideModels: z.record(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const preset = PRESET_PIPELINES[input.presetIndex];
        if (!preset) throw new TRPCError({ code: "NOT_FOUND", message: "Preset não encontrado" });
        const pipeline = {
          id: `run-${Date.now()}`,
          ...preset,
          initialPrompt: input.initialPrompt,
          steps: preset.steps.map(step => ({
            ...step,
            model: input.overrideModels?.[step.id] ?? step.model,
          })),
        };
        logGovernance("pipeline.runPreset", "pipeline", `Preset: "${preset.name}"`);
        try { return await executePipeline(pipeline); }
        catch (e) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Preset falhou: ${(e as Error).message}` }); }
      }),
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // 6. AI ALERTS
  // ══════════════════════════════════════════════════════════════════════════
  alerts: router({
    active: dgoProcedure.query(() => getActiveAlerts()),
    history: dgoProcedure
      .input(z.object({ limit: z.number().min(1).max(200).default(50) }))
      .query(({ input }) => getAllAlerts(input.limit)),
    checkHealth: dgoProcedure.mutation(async () => {
      const [hardware, temperature, ollamaStatus, runningModel] = await Promise.allSettled([
        getHardwareStats(), getTemperature(), getOllamaStatus(), getOllamaRunningModel(),
      ]);
      const hw = hardware.status === "fulfilled" ? hardware.value : null;
      const temp = temperature.status === "fulfilled" ? temperature.value : null;
      const ollama = ollamaStatus.status === "fulfilled" ? ollamaStatus.value : null;
      const running = runningModel.status === "fulfilled" ? runningModel.value : null;
      const newAlerts = await checkAIHealth({
        cpuTemp: temp?.cpuMaxTemp ?? undefined,
        gpuTemp: temp?.gpuTemp ?? undefined,
        ollamaOnline: ollama?.online,
        activeModel: running?.model,
        vramUsedMB: running?.sizeVRAM,
      });
      return { alertsGenerated: newAlerts.length, alerts: newAlerts, checkedAt: new Date().toISOString() };
    }),
    resolve: dgoProcedure
      .input(z.object({ alertId: z.string() }))
      .mutation(({ input }) => ({ success: resolveAlert(input.alertId), alertId: input.alertId })),
    create: dgoProcedure
      .input(z.object({
        severity: z.enum(["info", "warning", "critical"]),
        type: z.enum(["temperature", "vram", "timeout", "offline", "slow_response", "model_error"]),
        model: z.string().nullable().optional(),
        message: z.string().min(1).max(500),
        value: z.number().optional(),
        threshold: z.number().optional(),
      }))
      .mutation(({ input }) =>
        createAlert(input.severity, input.type, input.model ?? null, input.message, input.value, input.threshold)
      ),
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // 7. PROJECT TASKS — Kanban, Burnup, OPERIS Engines
  // ══════════════════════════════════════════════════════════════════════════
  project: router({
    /** Kanban Board completo */
    kanban: dgoProcedure.query(() => getKanbanBoard()),

    /** Lista todas as tarefas */
    tasks: dgoProcedure
      .input(z.object({
        status: z.enum(["backlog", "todo", "in_progress", "review", "done", "blocked", "all"]).default("all"),
        category: z.string().optional(),
        engine: z.string().optional(),
      }).optional())
      .query(({ input }) => {
        let tasks = getAllTasks();
        if (input?.status && input.status !== "all") tasks = tasks.filter(t => t.status === input.status);
        if (input?.category) tasks = tasks.filter(t => t.category === input.category);
        if (input?.engine) tasks = tasks.filter(t => t.engine === input.engine);
        return tasks;
      }),

    /** Criar tarefa */
    create: dgoProcedure
      .input(z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        status: z.enum(["backlog", "todo", "in_progress", "review", "done", "blocked"]).default("todo"),
        priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
        category: z.enum(["feature", "bug", "infra", "ai", "financial", "nfse", "docs", "security"]).default("feature"),
        engine: z.string().optional(),
        estimatedLines: z.number().min(0).optional(),
        tags: z.array(z.string()).default([]),
        dueDate: z.string().optional(),
      }))
      .mutation(({ input }) => {
        logGovernance("project.create", "project", `Nova tarefa: "${input.title}"`);
        return createTask(input);
      }),

    /** Atualizar tarefa */
    update: dgoProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(1000).optional(),
        status: z.enum(["backlog", "todo", "in_progress", "review", "done", "blocked"]).optional(),
        priority: z.enum(["critical", "high", "medium", "low"]).optional(),
        completedLines: z.number().min(0).optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        logGovernance("project.update", "project", `Tarefa atualizada: ${id}`);
        const updated = updateTask(id, data);
        if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada" });
        return updated;
      }),

    /** Mover tarefa no Kanban */
    move: dgoProcedure
      .input(z.object({
        id: z.string(),
        newStatus: z.enum(["backlog", "todo", "in_progress", "review", "done", "blocked"]),
      }))
      .mutation(({ input }) => {
        logGovernance("project.move", "project", `Tarefa ${input.id} → ${input.newStatus}`);
        const moved = moveTask(input.id, input.newStatus);
        if (!moved) throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada" });
        return moved;
      }),

    /** Deletar tarefa */
    delete: dgoProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => {
        logGovernance("project.delete", "project", `Tarefa deletada: ${input.id}`);
        const deleted = deleteTask(input.id);
        if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada" });
        return { success: true, id: input.id };
      }),

    /** Métricas de Burnup */
    burnup: dgoProcedure.query(async () => {
      try { return await getBurnupMetrics(); }
      catch (e) { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Burnup: ${(e as Error).message}` }); }
    }),

    /** Status dos 5 Motores OPERIS.eng */
    engines: dgoProcedure.query(() => getOperisEngines()),

    /** Estatísticas gerais do projeto */
    stats: dgoProcedure.query(() => getProjectStats()),

    /** Importar tarefas do TODO.md */
    importTodo: dgoProcedure
      .input(z.object({ filePath: z.string().optional() }))
      .mutation(async ({ input }) => {
        logGovernance("project.importTodo", "project", `Importando TODO.md: ${input.filePath ?? "auto-detect"}`);
        const imported = await parseTodoMd(input.filePath);
        return { imported: imported.length, tasks: imported };
      }),
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // 8. WEB SEARCH — Busca com Resumo por IA Local
  // ══════════════════════════════════════════════════════════════════════════
  search: router({
    /** Busca web com resumo por Gemma 2 */
    web: dgoProcedure
      .input(z.object({
        query: z.string().min(1).max(500),
        count: z.number().min(1).max(20).default(8),
        filterCategory: z.enum(["all", "documentation", "norm", "tech"]).default("all"),
        generateSummary: z.boolean().default(true),
        summaryModel: z.string().default("gemma2"),
        minRelevance: z.number().min(0).max(1).default(0.3),
      }))
      .mutation(async ({ input }) => {
        logGovernance("search.web", "search", `Query: "${input.query}" | Filtro: ${input.filterCategory}`);
        try {
          const result = await webSearch(input.query, {
            count: input.count,
            filterCategory: input.filterCategory,
            generateSummary: input.generateSummary,
            summaryModel: input.summaryModel,
            minRelevance: input.minRelevance,
          });
          logGovernance("search.complete", "search", `${result.totalResults} resultados | Provider: ${result.provider}`);
          return result;
        } catch (e) {
          logGovernance("search.web", "search", (e as Error).message, "error");
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Busca falhou: ${(e as Error).message}` });
        }
      }),

    /** Histórico de buscas recentes */
    history: dgoProcedure.query(() => {
      return governanceLogs
        .filter(l => l.module === "search" && l.action === "search.web")
        .slice(0, 20)
        .map(l => ({
          query: l.detail.replace('Query: "', "").replace('" | Filtro: all', "").replace('" | Filtro: documentation', "").replace('" | Filtro: norm', "").replace('" | Filtro: tech', ""),
          timestamp: l.timestamp,
          status: l.status,
        }));
    }),
  }),

  // ══════════════════════════════════════════════════════════════════════════
  // 10. SERVICE MANAGER — Spawn Streaming, Whitelist de Manutenção
  // ══════════════════════════════════════════════════════════════════════════
  serviceManager: serviceManagerRouter,

  // ══════════════════════════════════════════════════════════════════════════
  // 9. GOVERNANCE — Logs de Auditoria
  // ══════════════════════════════════════════════════════════════════════════
  governance: router({
    logs: dgoProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).default(100),
        module: z.enum(["docker", "shell", "ollama", "pipeline", "system", "project", "search", "all"]).default("all"),
        status: z.enum(["success", "error", "blocked", "all"]).default("all"),
      }))
      .query(({ input }) => {
        let logs = governanceLogs;
        if (input.module !== "all") logs = logs.filter(l => l.module === input.module as any);
        if (input.status !== "all") logs = logs.filter(l => l.status === input.status);
        return {
          logs: logs.slice(0, input.limit),
          total: logs.length,
          blocked: governanceLogs.filter(l => l.status === "blocked").length,
          errors: governanceLogs.filter(l => l.status === "error").length,
        };
      }),

    stats: dgoProcedure.query(() => {
      const byModule = governanceLogs.reduce((acc, log) => {
        acc[log.module] = (acc[log.module] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const last24h = governanceLogs.filter(l =>
        Date.now() - new Date(l.timestamp).getTime() < 24 * 60 * 60 * 1000
      ).length;
      return {
        total: governanceLogs.length,
        last24h,
        byModule,
        activeAlerts: getActiveAlerts().length,
        lastAction: governanceLogs[0] ?? null,
      };
    }),

    clearOld: dgoProcedure
      .input(z.object({ keepLast: z.number().min(10).max(500).default(100) }))
      .mutation(({ input }) => {
        const removed = governanceLogs.length - input.keepLast;
        if (removed > 0) governanceLogs.splice(input.keepLast);
        logGovernance("governance.clearOld", "system" as any, `Removidos ${removed} logs`);
        return { success: true, removed: Math.max(0, removed), remaining: governanceLogs.length };
      }),
  }),
});

export type DgoRouter = typeof dgoRouter;
