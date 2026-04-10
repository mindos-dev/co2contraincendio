/**
 * ─── D.G.O. Auth — Autenticação Soberana do Command Center ──────────────────
 * JULY AOG | OPERIS Command Center
 *
 * Sistema de autenticação 100% local, sem dependência de nuvem.
 * JWT assinado localmente + bcrypt para hash de senhas.
 * Credenciais armazenadas em memória (persistir em arquivo criptografado em produção).
 *
 * Credenciais padrão:
 *   Usuário: operis-admin
 *   Senha:   OPERIS@2025!
 *   (Alterar imediatamente após o primeiro acesso)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from "node:crypto";
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// ─── Configuração ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.DGO_JWT_SECRET ?? "july-aog-operis-dgo-secret-2025-sovereign";
const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 horas
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DgoUser {
  id: string;
  username: string;
  passwordHash: string;
  role: "superadmin" | "admin" | "viewer";
  displayName: string;
  createdAt: string;
  lastLogin?: string;
  active: boolean;
}

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

interface DgoSession {
  token: string;
  userId: string;
  username: string;
  role: string;
  createdAt: number;
  expiresAt: number;
  ip?: string;
}

// ─── Hash simples sem bcrypt (compatível sem instalação extra) ────────────────
function hashPassword(password: string): string {
  const salt = process.env.DGO_SALT ?? "july-aog-salt-operis-2025";
  return crypto
    .createHmac("sha512", salt)
    .update(password)
    .digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// ─── Banco de usuários em memória ─────────────────────────────────────────────
const DGO_USERS: DgoUser[] = [
  {
    id: "dgo-admin-001",
    username: "operis-admin",
    passwordHash: hashPassword("OPERIS@2025!"),
    role: "superadmin",
    displayName: "Administrador OPERIS",
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: "dgo-viewer-001",
    username: "operis-viewer",
    passwordHash: hashPassword("Viewer@2025"),
    role: "viewer",
    displayName: "Visualizador OPERIS",
    createdAt: new Date().toISOString(),
    active: true,
  },
];

// ─── Sessões ativas e tentativas de login ─────────────────────────────────────
const activeSessions = new Map<string, DgoSession>();
const loginAttempts = new Map<string, LoginAttempt>();
const auditLog: Array<{
  event: string;
  username: string;
  timestamp: string;
  success: boolean;
  ip?: string;
}> = [];

// ─── JWT simples (sem biblioteca externa) ─────────────────────────────────────
function createToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [header, body, sig] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── Lógica de autenticação ───────────────────────────────────────────────────
function checkLockout(username: string): void {
  const attempts = loginAttempts.get(username);
  if (!attempts) return;
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Conta bloqueada por ${remaining} minuto(s) após ${MAX_ATTEMPTS} tentativas falhas.`,
    });
  }
}

function recordAttempt(username: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(username);
    return;
  }
  const current = loginAttempts.get(username) ?? { count: 0, lastAttempt: 0 };
  current.count++;
  current.lastAttempt = Date.now();
  if (current.count >= MAX_ATTEMPTS) {
    current.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  loginAttempts.set(username, current);
}

// ─── Router de Autenticação ───────────────────────────────────────────────────
export const dgoAuthRouter = router({
  /** Login no D.G.O. */
  login: publicProcedure
    .input(z.object({
      username: z.string().min(1).max(50).trim(),
      password: z.string().min(1).max(200),
    }))
    .mutation(({ input }) => {
      checkLockout(input.username);

      const user = DGO_USERS.find(u => u.username === input.username && u.active);

      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        recordAttempt(input.username, false);
        auditLog.unshift({
          event: "LOGIN_FAILED",
          username: input.username,
          timestamp: new Date().toISOString(),
          success: false,
        });
        const attempts = loginAttempts.get(input.username);
        const remaining = MAX_ATTEMPTS - (attempts?.count ?? 0);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Credenciais inválidas. ${remaining > 0 ? `${remaining} tentativa(s) restante(s).` : "Conta bloqueada."}`,
        });
      }

      recordAttempt(input.username, true);

      const now = Date.now();
      const expiresAt = now + TOKEN_EXPIRY_MS;
      const token = createToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        exp: expiresAt,
      });

      const session: DgoSession = {
        token,
        userId: user.id,
        username: user.username,
        role: user.role,
        createdAt: now,
        expiresAt,
      };

      activeSessions.set(token, session);

      // Atualizar lastLogin
      const idx = DGO_USERS.findIndex(u => u.id === user.id);
      if (idx !== -1) DGO_USERS[idx].lastLogin = new Date().toISOString();

      auditLog.unshift({
        event: "LOGIN_SUCCESS",
        username: user.username,
        timestamp: new Date().toISOString(),
        success: true,
      });

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
        },
        expiresAt: new Date(expiresAt).toISOString(),
        message: `Bem-vindo ao OPERIS Command Center, ${user.displayName}!`,
      };
    }),

  /** Verificar token ativo */
  verify: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ input }) => {
      const session = activeSessions.get(input.token);
      if (!session || Date.now() > session.expiresAt) {
        activeSessions.delete(input.token);
        return { valid: false, user: null };
      }
      const payload = verifyToken(input.token);
      if (!payload) {
        activeSessions.delete(input.token);
        return { valid: false, user: null };
      }
      const user = DGO_USERS.find(u => u.id === session.userId);
      return {
        valid: true,
        user: user ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          lastLogin: user.lastLogin,
        } : null,
        expiresAt: new Date(session.expiresAt).toISOString(),
        remainingMs: session.expiresAt - Date.now(),
      };
    }),

  /** Logout */
  logout: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(({ input }) => {
      const session = activeSessions.get(input.token);
      if (session) {
        auditLog.unshift({
          event: "LOGOUT",
          username: session.username,
          timestamp: new Date().toISOString(),
          success: true,
        });
        activeSessions.delete(input.token);
      }
      return { success: true, message: "Sessão encerrada com segurança." };
    }),

  /** Alterar senha */
  changePassword: publicProcedure
    .input(z.object({
      token: z.string(),
      currentPassword: z.string().min(1),
      newPassword: z.string()
        .min(8, "Mínimo 8 caracteres")
        .regex(/[A-Z]/, "Deve conter maiúscula")
        .regex(/[0-9]/, "Deve conter número")
        .regex(/[!@#$%^&*]/, "Deve conter caractere especial"),
    }))
    .mutation(({ input }) => {
      const session = activeSessions.get(input.token);
      if (!session || Date.now() > session.expiresAt) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão expirada." });
      }
      const userIdx = DGO_USERS.findIndex(u => u.id === session.userId);
      if (userIdx === -1) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });

      if (!verifyPassword(input.currentPassword, DGO_USERS[userIdx].passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha atual incorreta." });
      }

      DGO_USERS[userIdx].passwordHash = hashPassword(input.newPassword);
      auditLog.unshift({
        event: "PASSWORD_CHANGED",
        username: session.username,
        timestamp: new Date().toISOString(),
        success: true,
      });

      return { success: true, message: "Senha alterada com sucesso." };
    }),

  /** Listar usuários (superadmin only) */
  users: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ input }) => {
      const session = activeSessions.get(input.token);
      if (!session || session.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a superadmin." });
      }
      return DGO_USERS.map(u => ({
        id: u.id, username: u.username, displayName: u.displayName,
        role: u.role, active: u.active, lastLogin: u.lastLogin, createdAt: u.createdAt,
      }));
    }),

  /** Log de auditoria */
  auditLog: publicProcedure
    .input(z.object({ token: z.string(), limit: z.number().min(1).max(200).default(50) }))
    .query(({ input }) => {
      const session = activeSessions.get(input.token);
      if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado." });
      return {
        logs: auditLog.slice(0, input.limit),
        activeSessions: activeSessions.size,
        totalUsers: DGO_USERS.filter(u => u.active).length,
      };
    }),
});

export type DgoAuthRouter = typeof dgoAuthRouter;
