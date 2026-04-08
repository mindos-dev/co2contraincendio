/**
 * OPERIS AI Router — Endpoints tRPC para o sistema RAG
 * Versão: 2.0
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import {
  searchChunks,
  askRag,
  ingestDocument,
  listDocuments,
  deleteDocument,
  getRagStats,
  initializeRagStore,
} from "./services/rag.service";
import { storagePut } from "./storage";

initializeRagStore();

export const aiRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string().min(3).max(500),
      topK: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ input }) => {
      const results = searchChunks(input.query, input.topK);
      return {
        query: input.query,
        results: results.map(r => ({
          id: r.chunk.id,
          documentTitle: r.chunk.documentTitle,
          content: r.chunk.content,
          highlight: r.highlight,
          score: r.score,
          norm: r.chunk.metadata.norm,
          category: r.chunk.metadata.category,
        })),
        total: results.length,
      };
    }),

  ask: publicProcedure
    .input(z.object({
      question: z.string().min(5).max(1000),
    }))
    .mutation(async ({ input }) => {
      return await askRag(input.question);
    }),

  stats: protectedProcedure
    .query(() => getRagStats()),
});

export const documentsRouter = router({
  upload: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(200),
      content: z.string().min(50).max(100000),
      norm: z.string().optional(),
      category: z.string().optional(),
      source: z.string().default("user_upload"),
    }))
    .mutation(async ({ input }) => {
      const doc = await ingestDocument(input.title, input.content, {
        source: input.source,
        norm: input.norm,
        category: input.category,
      });
      return {
        success: true,
        document: doc,
        message: `Documento "${doc.title}" indexado com ${doc.chunkCount} chunk(s).`,
      };
    }),

  uploadFile: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(200),
      contentBase64: z.string(),
      mimeType: z.enum(["text/plain", "text/html", "application/json"]),
      norm: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.contentBase64, "base64");
      const textContent = buffer.toString("utf-8");
      const key = `documents/${ctx.user.id}/${Date.now()}-${input.title.replace(/[^a-zA-Z0-9-_]/g, "_")}.txt`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      const doc = await ingestDocument(input.title, textContent, {
        source: url,
        norm: input.norm,
        category: input.category,
      });
      return {
        success: true,
        document: doc,
        fileUrl: url,
        message: `Arquivo "${doc.title}" enviado e indexado com ${doc.chunkCount} chunk(s).`,
      };
    }),

  list: protectedProcedure.query(() => listDocuments()),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const deleted = deleteDocument(input.id);
      if (!deleted) throw new Error(`Documento "${input.id}" não encontrado.`);
      return { success: true, message: "Documento removido com sucesso." };
    }),
});
