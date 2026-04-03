import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Contexto público (sem autenticação)
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { headers: {} } as unknown as TrpcContext["req"],
    res: {} as unknown as TrpcContext["res"],
  };
}

const caller = appRouter.createCaller(createPublicContext());

const testEmail = `test_${Date.now()}@operis.test`;
const testPassword = "senha@Teste123";

describe("saas.auth.register", () => {
  it("deve criar um novo usuário e retornar token", async () => {
    const result = await caller.saas.auth.register({
      name: "Usuário Teste OPERIS",
      email: testEmail,
      password: testPassword,
    });
    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.role).toBe("cliente");
  });

  it("deve rejeitar e-mail já cadastrado", async () => {
    await expect(
      caller.saas.auth.register({
        name: "Duplicado",
        email: testEmail,
        password: testPassword,
      })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("deve rejeitar senha curta (menos de 8 caracteres)", async () => {
    await expect(
      caller.saas.auth.register({
        name: "Teste",
        email: `short_${Date.now()}@test.com`,
        password: "123",
      })
    ).rejects.toBeTruthy();
  });
});

describe("saas.auth.login", () => {
  it("deve fazer login com credenciais corretas", async () => {
    const result = await caller.saas.auth.login({
      email: testEmail,
      password: testPassword,
    });
    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe(testEmail);
  });

  it("deve rejeitar senha incorreta", async () => {
    await expect(
      caller.saas.auth.login({ email: testEmail, password: "senhaErrada123" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("saas.auth.forgotPassword", () => {
  it("deve retornar sucesso mesmo para e-mail inexistente (segurança)", async () => {
    const result = await caller.saas.auth.forgotPassword({
      email: "naoexiste@operis.test",
    });
    expect(result.success).toBe(true);
  });

  it("deve retornar sucesso para e-mail cadastrado e gerar token", async () => {
    const result = await caller.saas.auth.forgotPassword({ email: testEmail });
    expect(result.success).toBe(true);
  });
});

describe("saas.auth.resetPassword", () => {
  it("deve rejeitar token inválido", async () => {
    await expect(
      caller.saas.auth.resetPassword({
        token: "token_invalido_xyz",
        password: "novaSenha@123",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
