/**
 * ─── DGO Auth Context — Autenticação Soberana do Command Center ─────────────
 * JULY AOG | OPERIS Command Center
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface DgoUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  lastLogin?: string;
}

interface DgoAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: DgoUser | null;
  token: string | null;
  error: string | null;
}

interface DgoAuthContext extends DgoAuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const DgoAuthCtx = createContext<DgoAuthContext | null>(null);

const TOKEN_KEY = "dgo_auth_token";

export function DgoAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DgoAuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
    error: null,
  });

  const loginMutation = trpc.dgoAuth.login.useMutation();
  const logoutMutation = trpc.dgoAuth.logout.useMutation();
  const verifyQuery = trpc.dgoAuth.verify.useQuery(
    { token: state.token ?? "" },
    {
      enabled: !!state.token,
      refetchInterval: 5 * 60 * 1000, // verificar a cada 5 minutos
      retry: false,
    }
  );

  // Restaurar sessão do localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setState(prev => ({ ...prev, token: savedToken, isLoading: true }));
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Reagir ao resultado da verificação
  useEffect(() => {
    if (!state.token) return;
    if (verifyQuery.isLoading) return;

    if (verifyQuery.data?.valid && verifyQuery.data.user) {
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        user: verifyQuery.data!.user as DgoUser,
        error: null,
      }));
    } else if (verifyQuery.data && !verifyQuery.data.valid) {
      // Token inválido ou expirado
      localStorage.removeItem(TOKEN_KEY);
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null,
      });
    } else if (verifyQuery.error) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [verifyQuery.data, verifyQuery.isLoading, verifyQuery.error, state.token]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await loginMutation.mutateAsync({ username, password });
      localStorage.setItem(TOKEN_KEY, result.token);
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: result.user as DgoUser,
        token: result.token,
        error: null,
      });
      return true;
    } catch (err: any) {
      const message = err?.message ?? "Erro de autenticação. Tente novamente.";
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return false;
    }
  }, [loginMutation]);

  const logout = useCallback(async () => {
    if (state.token) {
      try { await logoutMutation.mutateAsync({ token: state.token }); } catch {}
    }
    localStorage.removeItem(TOKEN_KEY);
    setState({ isAuthenticated: false, isLoading: false, user: null, token: null, error: null });
  }, [state.token, logoutMutation]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <DgoAuthCtx.Provider value={{ ...state, login, logout, clearError }}>
      {children}
    </DgoAuthCtx.Provider>
  );
}

export function useDgoAuth(): DgoAuthContext {
  const ctx = useContext(DgoAuthCtx);
  if (!ctx) throw new Error("useDgoAuth deve ser usado dentro de DgoAuthProvider");
  return ctx;
}
