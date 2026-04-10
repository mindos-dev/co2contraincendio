/**
 * ─── Service Manager Router — tRPC Endpoints ────────────────────────────────
 * JULY AOG | OPERIS Command Center
 *
 * Expõe o Service Manager via tRPC com:
 *  - spawn: inicia processo com streaming
 *  - poll: polling de output em tempo real (SSE-like)
 *  - kill: encerra processo ativo
 *  - history: histórico de execuções
 *  - stats: estatísticas do manager
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import {
  spawnCommand,
  killProcess,
  getCommandHistory,
  getCommandRun,
  getActiveRuns,
  getOutputSince,
  getServiceManagerStats,
  MAINTENANCE_COMMANDS,
} from "./service-manager";

const smProcedure = publicProcedure;

export const serviceManagerRouter = router({
  /** Lista todos os comandos disponíveis na whitelist */
  commands: smProcedure.query(() =>
    MAINTENANCE_COMMANDS.map(cmd => ({
      id: cmd.id,
      label: cmd.label,
      description: cmd.description,
      category: cmd.category,
      dangerous: cmd.dangerous,
      requiresConfirm: cmd.requiresConfirm,
      timeout: cmd.timeout,
      icon: cmd.icon,
      fullCommand: `${cmd.command} ${cmd.args.join(" ")}`,
    }))
  ),

  /** Inicia um comando com spawn (streaming) */
  spawn: smProcedure
    .input(z.object({
      commandId: z.string().min(1).max(80),
      extraArgs: z.array(z.string().max(200)).max(5).optional().default([]),
    }))
    .mutation(async ({ input }) => {
      const cmdDef = MAINTENANCE_COMMANDS.find(c => c.id === input.commandId);
      if (!cmdDef) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Comando '${input.commandId}' não está na whitelist de manutenção. Segurança JULY AOG ativa.`,
        });
      }

      // Iniciar processo sem aguardar conclusão (retorna runId imediatamente)
      const { runId } = spawnCommand(input.commandId, input.extraArgs);

      return {
        runId,
        commandId: input.commandId,
        label: cmdDef.label,
        fullCommand: `${cmdDef.command} ${cmdDef.args.join(" ")} ${input.extraArgs.join(" ")}`.trim(),
        startedAt: new Date().toISOString(),
        message: `Processo iniciado. Use poll(runId) para acompanhar o output em tempo real.`,
      };
    }),

  /** Polling de output — chamar a cada 500ms para simular streaming */
  poll: smProcedure
    .input(z.object({
      runId: z.string().min(1).max(64),
      sinceIndex: z.number().min(0).default(0),
    }))
    .query(({ input }) => {
      const result = getOutputSince(input.runId, input.sinceIndex);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Execução '${input.runId}' não encontrada`,
        });
      }
      return {
        ...result,
        nextIndex: input.sinceIndex + result.lines.length,
        runId: input.runId,
        polledAt: new Date().toISOString(),
      };
    }),

  /** Aguarda conclusão e retorna resultado completo */
  await: smProcedure
    .input(z.object({
      commandId: z.string().min(1).max(80),
      extraArgs: z.array(z.string().max(200)).max(5).optional().default([]),
    }))
    .mutation(async ({ input }) => {
      const cmdDef = MAINTENANCE_COMMANDS.find(c => c.id === input.commandId);
      if (!cmdDef) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Comando '${input.commandId}' não está na whitelist.`,
        });
      }

      const { runId, promise } = spawnCommand(input.commandId, input.extraArgs);
      const result = await promise;

      return {
        runId,
        ...result,
        outputText: result.output.map(l => l.text).join("\n"),
      };
    }),

  /** Encerra um processo ativo */
  kill: smProcedure
    .input(z.object({ runId: z.string().min(1).max(64) }))
    .mutation(({ input }) => {
      const killed = killProcess(input.runId);
      if (!killed) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Processo '${input.runId}' não está ativo`,
        });
      }
      return {
        success: true,
        runId: input.runId,
        killedAt: new Date().toISOString(),
        message: "Processo encerrado com SIGTERM",
      };
    }),

  /** Detalhes de uma execução específica */
  run: smProcedure
    .input(z.object({ runId: z.string().min(1).max(64) }))
    .query(({ input }) => {
      const run = getCommandRun(input.runId);
      if (!run) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Execução '${input.runId}' não encontrada`,
        });
      }
      return run;
    }),

  /** Histórico de execuções */
  history: smProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(({ input }) => getCommandHistory(input.limit)),

  /** Processos ativos */
  active: smProcedure.query(() => getActiveRuns()),

  /** Estatísticas gerais */
  stats: smProcedure.query(() => getServiceManagerStats()),
});

export type ServiceManagerRouter = typeof serviceManagerRouter;
