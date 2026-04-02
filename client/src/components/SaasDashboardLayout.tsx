import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useSaasAuth } from "@/contexts/SaasAuthContext";

interface NavItem { label: string; path: string; icon: string; adminOnly?: boolean; mobileHide?: boolean; }

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",       path: "/app/dashboard",    icon: "⬛" },
  { label: "Equipamentos",    path: "/app/equipamentos",  icon: "🧯" },
  { label: "Manutenções",     path: "/app/manutencoes",   icon: "🔧" },
  { label: "QR Codes",        path: "/app/qrcodes",       icon: "▦" },
  { label: "Alertas",         path: "/app/alertas",       icon: "⚠" },
  { label: "Documentos",      path: "/app/documentos",    icon: "📄", mobileHide: true },
  { label: "Notificações",    path: "/app/notificacoes",  icon: "🔔", mobileHide: true },
  { label: "Clientes",        path: "/app/clientes",      icon: "🏢", adminOnly: true, mobileHide: true },
  { label: "Relatórios",      path: "/app/relatorios",    icon: "📊", adminOnly: true, mobileHide: true },
  { label: "Busca Inteligente", path: "/app/busca",       icon: "🧠", adminOnly: true, mobileHide: true },
  { label: "Usuários",        path: "/app/usuarios",      icon: "👤", adminOnly: true, mobileHide: true },
  { label: "Vistoria Mobile", path: "/mobile",            icon: "📱" },
  { label: "OPERIS IA",       path: "/operis",            icon: "🛡️", adminOnly: true, mobileHide: true },
];

// Bottom nav mobile: apenas os 5 itens principais
const MOBILE_NAV = [
  { label: "Dashboard",    path: "/app/dashboard",   icon: "⬛" },
  { label: "Equipamentos", path: "/app/equipamentos", icon: "🧯" },
  { label: "Manutenções",  path: "/app/manutencoes",  icon: "🔧" },
  { label: "QR Codes",     path: "/app/qrcodes",      icon: "▦" },
  { label: "Alertas",      path: "/app/alertas",      icon: "⚠" },
  { label: "Vistoria",     path: "/mobile",           icon: "📱" },
];

export default function SaasDashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin, isAuthenticated } = useSaasAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visible = NAV_ITEMS.filter(i => !i.adminOnly || isAdmin);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/app/login");
    }
  }, [isAuthenticated, setLocation]);

  // Fechar menu mobile ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ─── DESKTOP LAYOUT ─────────────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen" style={{ background: "#F2F2F2" }}>
        {/* Sidebar */}
        <aside style={{ width: collapsed ? 56 : 220, background: "#111111", display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          {/* Brand */}
          <div style={{ padding: "16px 12px", borderBottom: "1px solid #2C2C2C", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.03em" }}>CO2</span>
            </div>
            {!collapsed && <div>
              <div style={{ color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em" }}>CO2 CONTRA INCÊNDIO</div>
              <div style={{ color: "#8A8A8A", fontSize: 9, letterSpacing: "0.1em" }}>PLATAFORMA OPERIS</div>
            </div>}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, paddingTop: 8, overflowY: "auto" }}>
            {visible.map(item => {
              const active = location === item.path || location.startsWith(item.path + "/");
              return (
                <Link key={item.path} href={item.path}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "11px 12px" : "11px 14px", cursor: "pointer", background: active ? "#C8102E" : "transparent", borderLeft: `3px solid ${active ? "#FF3355" : "transparent"}`, transition: "background 0.15s" }}>
                    <span style={{ fontSize: 15, flexShrink: 0, opacity: active ? 1 : 0.65 }}>{item.icon}</span>
                    {!collapsed && <span style={{ color: active ? "#fff" : "#D8D8D8", fontSize: 13, fontWeight: active ? 600 : 400, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div style={{ padding: "12px", borderTop: "1px solid #2C2C2C" }}>
            {!collapsed && user && <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#D8D8D8", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ color: "#8A8A8A", fontSize: 10, letterSpacing: "0.06em" }}>{user.role.toUpperCase()}</div>
            </div>}
            <button onClick={logout} style={{ width: "100%", padding: "7px", background: "transparent", border: "1px solid #4A4A4A", color: "#8A8A8A", fontSize: 11, cursor: "pointer", letterSpacing: "0.06em" }}>
              {collapsed ? "↩" : "SAIR"}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header style={{ background: "#111111", borderBottom: "3px solid #C8102E", padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
            <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", color: "#D8D8D8", cursor: "pointer", fontSize: 18, padding: "4px 6px" }}>☰</button>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/"><span style={{ color: "#8A8A8A", fontSize: 11, cursor: "pointer", letterSpacing: "0.06em" }}>← SITE</span></Link>
              {user && <span style={{ color: "#D8D8D8", fontSize: 12 }}>{user.name}</span>}
            </div>
          </header>
          <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>{children}</main>
        </div>
      </div>

      {/* ─── MOBILE LAYOUT ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:hidden min-h-screen" style={{ background: "#F2F2F2" }}>
        {/* Mobile Top Bar */}
        <header style={{ background: "#111111", borderBottom: "3px solid #C8102E", padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 9, fontFamily: "'Barlow Condensed',sans-serif" }}>CO2</span>
            </div>
            <div style={{ color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}>OPERIS</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/"><span style={{ color: "#8A8A8A", fontSize: 11, cursor: "pointer" }}>← Site</span></Link>
            {/* Botão "Mais" para abrir menu completo */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: "none", border: "none", color: "#D8D8D8", cursor: "pointer", fontSize: 20, padding: "4px" }}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </header>

        {/* Mobile Drawer (menu completo) */}
        {mobileMenuOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setMobileMenuOpen(false)}>
            <div
              style={{ position: "absolute", top: 52, right: 0, width: 260, bottom: 0, background: "#111111", overflowY: "auto", borderLeft: "1px solid #2C2C2C" }}
              onClick={(e) => e.stopPropagation()}
            >
              <nav style={{ paddingTop: 8 }}>
                {visible.map(item => {
                  const active = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer", background: active ? "#C8102E" : "transparent", borderLeft: `3px solid ${active ? "#FF3355" : "transparent"}` }}>
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        <span style={{ color: active ? "#fff" : "#D8D8D8", fontSize: 14, fontWeight: active ? 600 : 400 }}>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
              {/* User info + logout no drawer */}
              <div style={{ padding: "16px 18px", borderTop: "1px solid #2C2C2C", marginTop: 8 }}>
                {user && <div style={{ marginBottom: 12 }}>
                  <div style={{ color: "#D8D8D8", fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ color: "#8A8A8A", fontSize: 11, letterSpacing: "0.06em" }}>{user.role.toUpperCase()}</div>
                </div>}
                <button onClick={logout} style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #4A4A4A", color: "#8A8A8A", fontSize: 12, cursor: "pointer", letterSpacing: "0.06em" }}>
                  SAIR DA CONTA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <main style={{ flex: 1, padding: "16px", paddingBottom: 80, overflowY: "auto" }}>
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#111111", borderTop: "2px solid #C8102E", display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {MOBILE_NAV.map(item => {
            const active = location === item.path || location.startsWith(item.path + "/");
            return (
              <Link key={item.path} href={item.path} style={{ flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 4px", cursor: "pointer", background: active ? "#C8102E18" : "transparent", borderTop: `2px solid ${active ? "#C8102E" : "transparent"}`, marginTop: -2 }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
                  <span style={{ fontSize: 9, color: active ? "#C8102E" : "#8A8A8A", marginTop: 3, fontWeight: active ? 700 : 400, letterSpacing: "0.04em" }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
          {/* Botão "Mais" na bottom nav */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 4px", background: "transparent", border: "none", cursor: "pointer", borderTop: `2px solid ${mobileMenuOpen ? "#C8102E" : "transparent"}`, marginTop: -2 }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>⋯</span>
            <span style={{ fontSize: 9, color: mobileMenuOpen ? "#C8102E" : "#8A8A8A", marginTop: 3, fontWeight: mobileMenuOpen ? 700 : 400, letterSpacing: "0.04em" }}>Mais</span>
          </button>
        </nav>
      </div>
    </>
  );
}
