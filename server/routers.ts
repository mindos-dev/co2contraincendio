import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { insertOrcamento } from "./db";
import { saasRouter } from "./saas-routers";
import { fieldRouter } from "./field-router";
import { operisRouter } from "./operis-router";
import { billingRouter } from "./billing-router";
import { vistoriaRouter } from "./vistoria-router";
import { enterpriseRouter } from "./enterprise-router";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  saas: saasRouter,
  field: fieldRouter,
  operis: operisRouter,
  billing: billingRouter,
  vistoria: vistoriaRouter,
  enterprise: enterpriseRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orcamento: router({
    submit: publicProcedure
      .input(
        z.object({
          nome: z.string().min(2).max(120),
          telefone: z.string().min(8).max(30),
          email: z.string().email().optional().or(z.literal("")),
          empresa: z.string().max(160).optional(),
          servico: z.string().max(80).default("sistema-saponificante"),
          mensagem: z.string().max(1000).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id } = await insertOrcamento({
          nome: input.nome,
          telefone: input.telefone,
          email: input.email || null,
          empresa: input.empresa || null,
          servico: input.servico,
          mensagem: input.mensagem || null,
        });

        // Notificar o proprietario
        await notifyOwner({
          title: `Novo Orcamento #${id} - ${input.servico}`,
          content: `Nome: ${input.nome}\nTelefone: ${input.telefone}\nE-mail: ${input.email || "-"}\nEmpresa: ${input.empresa || "-"}\nServico: ${input.servico}\nMensagem: ${input.mensagem || "-"}`,
        });

        return { success: true, id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
