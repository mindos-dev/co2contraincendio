import { createContext, useContext, useState, ReactNode } from "react";

interface SaasUser {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId: number | null;
}

interface SaasAuthContextType {
  user: SaasUser | null;
  token: string | null;
  login: (token: string, user: SaasUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const SaasAuthContext = createContext<SaasAuthContextType | null>(null);
const TOKEN_KEY = "co2_saas_token";
const USER_KEY = "co2_saas_user";

export function SaasAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<SaasUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    try { return stored ? JSON.parse(stored) : null; } catch { return null; }
  });

  const login = (newToken: string, newUser: SaasUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <SaasAuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token && !!user, isAdmin: !!user && ["superadmin", "admin"].includes(user.role) }}>
      {children}
    </SaasAuthContext.Provider>
  );
}

export function useSaasAuth() {
  const ctx = useContext(SaasAuthContext);
  if (!ctx) throw new Error("useSaasAuth must be used inside SaasAuthProvider");
  return ctx;
}
