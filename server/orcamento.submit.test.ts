import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db and notification
vi.mock("./db", () => ({
  insertOrcamento: vi.fn().mockResolvedValue({ id: 42 }),
}));
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("orcamento.submit", () => {
  it("salva orçamento e retorna success:true com id", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.orcamento.submit({
      nome: "João Silva",
      telefone: "(31) 99999-0000",
      email: "joao@exemplo.com",
      empresa: "Restaurante Bom Sabor",
      servico: "sistema-saponificante",
      mensagem: "Preciso proteger 3 fritadeiras.",
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe(42);
  });

  it("aceita envio sem campos opcionais", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.orcamento.submit({
      nome: "Maria",
      telefone: "31988880000",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita nome muito curto", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.orcamento.submit({ nome: "A", telefone: "31988880000" })
    ).rejects.toThrow();
  });

  it("rejeita telefone muito curto", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.orcamento.submit({ nome: "João Silva", telefone: "123" })
    ).rejects.toThrow();
  });
});
