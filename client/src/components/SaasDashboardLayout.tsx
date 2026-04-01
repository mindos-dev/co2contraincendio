import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useSaasAuth } from "@/contexts/SaasAuthContext";

interface NavItem { label: string; path: string; icon: string; adminOnly?: boolean; }

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/app/dashboard", icon: "⬛" },
  { label: "Equipamentos", path: "/app/equipamentos", icon: "🧯" },
  { label: "Manutenções", path: "/app/manutencoes", icon: "🔧" },
  { label: "QR Codes", path: "/app/qrcodes", icon: "▦" },
  { label: "Alertas", path: "/app/alertas", icon: "⚠" },
  { label: "Documentos", path: "/app/documentos", icon: "📄" },
  { label: "Notificações", path: "/app/notificacoes", icon: "🔔" },
  { label: "Clientes", path: "/app/clientes", icon: "🏢", adminOnly: true },
];

export default function SaasDashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin, isAuthenticated } = useSaasAuth();
  const [collapsed, setCollapsed] = useState(false);
  const visible = NAV_ITEMS.filter(i => !i.adminOnly || isAdmin);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/app/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen" style={{ background: "#F2F2F2" }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 56 : 220, background: "#111111", display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* Brand */}
        <div style={{ padding: "16px 12px", borderBottom: "1px solid #2C2C2C", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#C8102E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.03em" }}>CO2</span>
          </div>
          {!collapsed && <div>
            <div style={{ color: "#fff", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em" }}>CO2 CONTRA INCÊNDIO</div>
            <div style={{ color: "#8A8A8A", fontSize: 9, letterSpacing: "0.1em" }}>PLATAFORMA</div>
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
        {/* Top bar */}
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
  );
}
