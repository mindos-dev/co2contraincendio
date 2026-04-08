import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import PaywallGuard from "@/components/PaywallGuard";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import {
  LayoutDashboard, ClipboardList, CheckSquare, Package, FileText,
  Users, DollarSign, Receipt, Brain, Settings, BookOpen,
  ChevronDown, ChevronRight, LogOut, Menu, X, Bell, Search,
  Wrench, QrCode, AlertTriangle, FolderOpen, Building2, Shield, UserCircle,
  CreditCard, TrendingUp, ClipboardCheck, HardHat, Landmark, FileSpreadsheet, BarChart3,
  FileBadge2, Home, ScanLine, Flame, Cpu, ShoppingCart, Globe
} from "lucide-react";

// ─── Navigation Structure ─────────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  children?: NavItem[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "",
    items: [
      { label: "Dashboard", path: "/app/dashboard", icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Work Orders (OS)", path: "/app/os", icon: <ClipboardList size={16} /> },
      {
        label: "Vistorias de Imóveis",
        path: "/operis/vistorias",
        icon: <ClipboardCheck size={16} />,
        children: [
          { label: "Nova Vistoria", path: "/operis/vistorias/nova", icon: <ClipboardCheck size={14} /> },
          { label: "Vistoria Cautelar", path: "/operis/engenharia/vistoria-cautelar", icon: <Shield size={14} /> },
          { label: "Laudo de Reforma / ART", path: "/operis/engenharia/laudo-reforma", icon: <FileText size={14} /> },
          { label: "Comparador Entrada/Saída", path: "/operis/vistorias/comparador", icon: <ClipboardList size={14} /> },
        ],
      },
      {
        label: "Sistemas Fixos de Incêndio",
        path: "/app/fire-system",
        icon: <Flame size={16} />,
        children: [
          { label: "Nova Vistoria NBR 14518", path: "/app/fire-system/nova", icon: <ClipboardCheck size={14} /> },
          { label: "Todas as Vistorias", path: "/app/fire-system", icon: <ClipboardList size={14} /> },
        ],
      },
      { label: "Engenheiros Parceiros", path: "/operis/parceiros-engenheiros", icon: <Users size={16} />, adminOnly: true },
    ],
  },
  {
    group: "Acompanhamento de Equipamentos",
    items: [
      { label: "Checklist", path: "/app/checklist", icon: <CheckSquare size={16} /> },
      { label: "Equipamentos", path: "/app/equipamentos", icon: <Package size={16} /> },
      { label: "Manutenções", path: "/app/manutencoes", icon: <Wrench size={16} /> },
      { label: "QR Codes", path: "/app/qrcodes", icon: <QrCode size={16} /> },
      { label: "Alertas", path: "/app/alertas", icon: <AlertTriangle size={16} /> },
      { label: "Scanner de Equipamento", path: "/app/scanner", icon: <ScanLine size={16} /> },
    ],
  },
  {
    group: "Engenharia Diagnóstica",
    items: [
      { label: "Inspeção Predial", path: "/operis/engenharia/inspecao-predial", icon: <Building2 size={16} /> },
      { label: "Planejador de Manutenção", path: "/operis/vistorias/manutencao", icon: <Wrench size={16} /> },
    ],
  },
  {
    group: "Engineering",
    items: [
      { label: "Laudos (Reports)", path: "/app/relatorios", icon: <FileText size={16} />, adminOnly: true },
      { label: "Propostas", path: "/app/propostas", icon: <FolderOpen size={16} />, adminOnly: true },
      { label: "Clientes", path: "/app/clientes", icon: <Building2 size={16} />, adminOnly: true },
      { label: "Documentos", path: "/app/documentos", icon: <FolderOpen size={16} /> },
      { label: "ART OPERIS", path: "/app/art", icon: <FileBadge2 size={16} /> },
      { label: "Aprovações ART", path: "/app/art/aprovacoes", icon: <FileBadge2 size={16} />, adminOnly: true },
    ],
  },
  {
    group: "Financial",
    items: [
      { label: "Financeiro", path: "/app/financeiro", icon: <DollarSign size={16} />, adminOnly: true },
      { label: "NFS-e", path: "/app/nfse", icon: <Receipt size={16} />, adminOnly: true },
      { label: "Assinatura", path: "/app/assinatura", icon: <CreditCard size={16} /> },
      { label: "MRR Dashboard", path: "/app/financeiro-mrr", icon: <TrendingUp size={16} />, adminOnly: true },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "AI Assistant", path: "/operis", icon: <Brain size={16} /> },
      { label: "Busca Inteligente", path: "/app/busca", icon: <Search size={16} />, adminOnly: true },
      { label: "Notificações", path: "/app/notificacoes", icon: <Bell size={16} /> },
    ],
  },
  {
    group: "OPERIS.eng",
    items: [
      {
        label: "OPERIS.eng",
        path: "/app/operis-eng",
        icon: <Cpu size={16} />,
        children: [
          { label: "Painel Principal", path: "/app/operis-eng", icon: <Cpu size={14} /> },
          { label: "Motor Comercial", path: "/app/operis-eng/comercial", icon: <ShoppingCart size={14} /> },
          { label: "Motor Operacional", path: "/app/operis-eng/operacional", icon: <Globe size={14} /> },
          { label: "Autoaprendizagem", path: "/app/operis-eng/aprendizagem", icon: <Brain size={14} /> },
          { label: "Governança", path: "/app/operis-eng/governanca", icon: <Shield size={14} /> },
        ],
      },
    ],
  },
  {
    group: "Enterprise",
    items: [
      { label: "Dashboard Executivo", path: "/app/executivo", icon: <BarChart3 size={16} />, adminOnly: true },
      { label: "Gestão de Obras", path: "/app/obras", icon: <HardHat size={16} />, adminOnly: true },
      { label: "Financeiro Enterprise", path: "/app/financeiro-enterprise", icon: <Landmark size={16} />, adminOnly: true },
      { label: "Mão de Obra", path: "/app/mao-de-obra", icon: <Users size={16} />, adminOnly: true },
      { label: "NF-e / Fiscal", path: "/app/nfe", icon: <FileSpreadsheet size={16} />, adminOnly: true },
    ],
  },
  {
    group: "Settings",
    items: [
      { label: "Usuários", path: "/app/usuarios", icon: <Users size={16} />, adminOnly: true },
      { label: "Onboarding", path: "/app/onboarding", icon: <BookOpen size={16} />, adminOnly: true },
      { label: "Configurações", path: "/app/configuracoes", icon: <Settings size={16} /> },
    ],
  },
];

// Mobile bottom nav
const MOBILE_NAV = [
  { label: "Dashboard", path: "/app/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "OS", path: "/app/os", icon: <ClipboardList size={20} /> },
  { label: "Scanner", path: "/app/scanner", icon: <ScanLine size={20} /> },
  { label: "Equip.", path: "/app/equipamentos", icon: <Package size={20} /> },
  { label: "IA", path: "/operis", icon: <Brain size={20} /> },
];

const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 56;

// ─── NavItemRow — renders a single item or an item with children ──────────────
function NavItemRow({
  item,
  collapsed,
  isActive,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: (path: string) => boolean;
  depth?: number;
}) {
  // Vistorias de Imóveis sempre expandido por padrão
  const defaultOpen = item.path === "/operis/vistorias";
  const [open, setOpen] = useState(defaultOpen);
  const active = isActive(item.path);
  const hasChildren = item.children && item.children.length > 0;
  const anyChildActive = item.children?.some(c => isActive(c.path)) ?? false;

  // Auto-open if a child is active
  useEffect(() => {
    if (anyChildActive) setOpen(true);
  }, [anyChildActive]);

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
    padding: collapsed ? "0.625rem 0" : `0.5rem 1rem 0.5rem ${depth > 0 ? "2rem" : "1rem"}`,
    justifyContent: collapsed ? "center" : "flex-start",
    background: active || anyChildActive ? OPERIS_COLORS.primaryMuted : "transparent",
    borderLeft: active || anyChildActive ? `2px solid ${OPERIS_COLORS.primary}` : "2px solid transparent",
    color: active || anyChildActive ? OPERIS_COLORS.primary : OPERIS_COLORS.textSecondary,
    cursor: "pointer",
    transition: "all 0.15s",
    fontSize: depth > 0 ? "0.75rem" : "0.8125rem",
    fontWeight: active ? 600 : 400,
    whiteSpace: "nowrap",
    overflow: "hidden",
  };

  if (hasChildren && !collapsed) {
    return (
      <div>
        <div
          style={rowStyle}
          onClick={() => setOpen(o => !o)}
          onMouseEnter={(e) => {
            if (!active && !anyChildActive) {
              (e.currentTarget as HTMLDivElement).style.background = OPERIS_COLORS.bgHover;
              (e.currentTarget as HTMLDivElement).style.color = OPERIS_COLORS.textPrimary;
            }
          }}
          onMouseLeave={(e) => {
            if (!active && !anyChildActive) {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
              (e.currentTarget as HTMLDivElement).style.color = OPERIS_COLORS.textSecondary;
            }
          }}
        >
          <span style={{ flexShrink: 0 }}>{item.icon}</span>
          <span style={{ flex: 1 }}>{item.label}</span>
          <span style={{ flexShrink: 0, color: OPERIS_COLORS.textDisabled }}>
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        </div>
        {open && (
          <div>
            {item.children!.map(child => (
              <NavItemRow
                key={child.path}
                item={child}
                collapsed={collapsed}
                isActive={isActive}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.path}>
      <div
        title={collapsed ? item.label : undefined}
        style={rowStyle}
        onMouseEnter={(e) => {
          if (!active) {
            (e.currentTarget as HTMLDivElement).style.background = OPERIS_COLORS.bgHover;
            (e.currentTarget as HTMLDivElement).style.color = OPERIS_COLORS.textPrimary;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
            (e.currentTarget as HTMLDivElement).style.color = OPERIS_COLORS.textSecondary;
          }
        }}
      >
        <span style={{ flexShrink: 0 }}>{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
      </div>
    </Link>
  );
}

export default function SaasDashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin, isAuthenticated } = useSaasAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "": true,
    "Operations": true,
    "Acompanhamento de Equipamentos": true,
    "Engenharia Diagnóstica": false,
    "Engineering": false,
    "Financial": false,
    "Intelligence": false,
    "OPERIS.eng": false,
    "Enterprise": false,
    "Settings": false,
  });

  useEffect(() => {
    if (!isAuthenticated) setLocation("/app/login");
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Auto-expand group containing current route
  useEffect(() => {
    for (const g of NAV_GROUPS) {
      const allItems = g.items.flatMap(i => [i, ...(i.children ?? [])]);
      if (allItems.some(i => location.startsWith(i.path))) {
        setExpandedGroups(prev => ({ ...prev, [g.group]: true }));
      }
    }
  }, [location]);

  if (!isAuthenticated) return null;

  const visibleGroups = NAV_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(i => !i.adminOnly || isAdmin),
  })).filter(g => g.items.length > 0);

  const toggleGroup = (group: string) => {
    if (collapsed) return;
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const isActive = (path: string) => {
    if (path === "/operis") return location === "/operis";
    return location === path || location.startsWith(path + "/");
  };

  const currentLabel = visibleGroups
    .flatMap(g => g.items.flatMap(i => [i, ...(i.children ?? [])]))
    .find(i => isActive(i.path))?.label ?? "Dashboard";

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div
      style={{
        width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
        minHeight: "100vh",
        background: OPERIS_COLORS.bgCard,
        borderRight: `1px solid ${OPERIS_COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Logo — Home Button */}
      <Link href="/app/dashboard">
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "0 0.75rem" : "0 0.875rem 0 1rem",
            borderBottom: `1px solid ${OPERIS_COLORS.border}`,
            flexShrink: 0,
            cursor: "pointer",
            textDecoration: "none",
          }}
          title="Ir para o Dashboard"
        >
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: OPERIS_COLORS.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Shield size={15} color="#fff" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.0625rem",
                    letterSpacing: "0.1em",
                    color: OPERIS_COLORS.textPrimary,
                    lineHeight: 1,
                  }}
                >
                  OPERIS
                </div>
                <div
                  style={{
                    fontSize: "0.5625rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    color: OPERIS_COLORS.textMuted,
                    textTransform: "uppercase",
                    lineHeight: 1,
                    marginTop: 2,
                  }}
                >
                  Engineering Intelligence
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              style={{
                width: 28,
                height: 28,
                background: OPERIS_COLORS.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Home size={15} color="#fff" />
            </div>
          )}
        </div>
      </Link>

      {/* Collapse toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
          padding: "0.375rem 0.75rem",
          borderBottom: `1px solid ${OPERIS_COLORS.border}`,
        }}
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: "transparent",
            border: "none",
            color: OPERIS_COLORS.textMuted,
            cursor: "pointer",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
          }}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0.375rem 0" }}>
        {visibleGroups.map((g) => (
          <div key={g.group || "root"}>
            {g.group && !collapsed && (
              <button
                onClick={() => toggleGroup(g.group)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 1rem 0.25rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "0.375rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: OPERIS_COLORS.textDisabled,
                  }}
                >
                  {g.group}
                </span>
                <span style={{ color: OPERIS_COLORS.textDisabled }}>
                  {expandedGroups[g.group] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </span>
              </button>
            )}

            {(collapsed || !g.group || expandedGroups[g.group]) && (
              <div>
                {g.items.map((item) => (
                  <NavItemRow
                    key={item.path}
                    item={item}
                    collapsed={collapsed}
                    isActive={isActive}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div
        style={{
          borderTop: `1px solid ${OPERIS_COLORS.border}`,
          padding: collapsed ? "0.75rem 0" : "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: OPERIS_COLORS.primaryMuted,
            border: `1px solid ${OPERIS_COLORS.primaryBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: OPERIS_COLORS.primary,
            flexShrink: 0,
          }}
        >
          {(user?.name ?? "U").charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: OPERIS_COLORS.textPrimary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name ?? "Usuário"}
              </div>
              <div
                style={{
                  fontSize: "0.625rem",
                  color: OPERIS_COLORS.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {user?.role ?? "user"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.125rem", flexShrink: 0 }}>
              <button
                onClick={() => setLocation("/app/perfil")}
                title="Meu Perfil"
                style={{
                  background: "transparent",
                  border: "none",
                  color: OPERIS_COLORS.textMuted,
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = OPERIS_COLORS.primary)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = OPERIS_COLORS.textMuted)}
              >
                <UserCircle size={15} />
              </button>
              <button
                onClick={logout}
                title="Sair"
                style={{
                  background: "transparent",
                  border: "none",
                  color: OPERIS_COLORS.textMuted,
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = OPERIS_COLORS.danger)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = OPERIS_COLORS.textMuted)}
              >
                <LogOut size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ─── DESKTOP ──────────────────────────────────────────────────────── */}
      <div className="operis-app hidden md:flex" style={{ minHeight: "100vh", background: OPERIS_COLORS.bg }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Top Bar */}
          <div
            style={{
              height: 56,
              background: OPERIS_COLORS.bgCard,
              borderBottom: `1px solid ${OPERIS_COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 1.5rem",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted }}>OPERIS</span>
              <ChevronRight size={12} color={OPERIS_COLORS.textMuted} />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: OPERIS_COLORS.textSecondary }}>
                {currentLabel}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link href="/app/alertas">
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: OPERIS_COLORS.textMuted,
                    cursor: "pointer",
                    padding: "0.375rem",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = OPERIS_COLORS.textPrimary)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = OPERIS_COLORS.textMuted)}
                  title="Alertas"
                >
                  <Bell size={16} />
                </button>
              </Link>
              <div style={{ width: 1, height: 20, background: OPERIS_COLORS.border }} />
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: OPERIS_COLORS.primaryMuted,
                    border: `1px solid ${OPERIS_COLORS.primaryBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: OPERIS_COLORS.primary,
                  }}
                >
                  {(user?.name ?? "U").charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textSecondary }}>
                  {user?.name?.split(" ")[0] ?? "Usuário"}
                </span>
              </div>
            </div>
          </div>
          <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto", color: OPERIS_COLORS.textPrimary }}>
            <PaywallGuard>{children}</PaywallGuard>
          </main>
        </div>
      </div>

      {/* ─── MOBILE ───────────────────────────────────────────────────────── */}
      <div className="flex md:hidden" style={{ flexDirection: "column", minHeight: "100vh", background: OPERIS_COLORS.bg }}>
        {/* Mobile Top Bar */}
        <div
          style={{
            height: 52,
            background: OPERIS_COLORS.bgCard,
            borderBottom: `1px solid ${OPERIS_COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1rem",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <Link href="/app/dashboard">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: OPERIS_COLORS.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={13} color="#fff" />
              </div>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: "0.1em",
                  color: OPERIS_COLORS.textPrimary,
                }}
              >
                OPERIS
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{
              background: "transparent",
              border: "none",
              color: OPERIS_COLORS.textSecondary,
              cursor: "pointer",
              padding: "0.375rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
            <div
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}
              onClick={() => setMobileOpen(false)}
            />
            <div
              style={{
                position: "relative",
                width: 260,
                background: OPERIS_COLORS.bgCard,
                borderRight: `1px solid ${OPERIS_COLORS.border}`,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                zIndex: 101,
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  borderBottom: `1px solid ${OPERIS_COLORS.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Link href="/app/dashboard">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        background: OPERIS_COLORS.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Shield size={15} color="#fff" />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 800,
                          fontSize: "1rem",
                          letterSpacing: "0.1em",
                          color: OPERIS_COLORS.textPrimary,
                          lineHeight: 1,
                        }}
                      >
                        OPERIS
                      </div>
                      <div
                        style={{
                          fontSize: "0.5625rem",
                          color: OPERIS_COLORS.textMuted,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Engineering Intelligence
                      </div>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ background: "transparent", border: "none", color: OPERIS_COLORS.textMuted, cursor: "pointer" }}
                >
                  <X size={18} />
                </button>
              </div>
              <nav style={{ flex: 1, padding: "0.5rem 0" }}>
                {visibleGroups.map((g) => (
                  <div key={g.group || "root"}>
                    {g.group && (
                      <div
                        style={{
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: OPERIS_COLORS.textDisabled,
                          padding: "0.75rem 1rem 0.25rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {g.group}
                      </div>
                    )}
                    {g.items.map((item) => (
                      <NavItemRow
                        key={item.path}
                        item={item}
                        collapsed={false}
                        isActive={isActive}
                      />
                    ))}
                  </div>
                ))}
              </nav>
              <div
                style={{
                  borderTop: `1px solid ${OPERIS_COLORS.border}`,
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: OPERIS_COLORS.primaryMuted,
                    border: `1px solid ${OPERIS_COLORS.primaryBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: OPERIS_COLORS.primary,
                  }}
                >
                  {(user?.name ?? "U").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: OPERIS_COLORS.textPrimary }}>{user?.name ?? "Usuário"}</div>
                  <div style={{ fontSize: "0.6875rem", color: OPERIS_COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{user?.role ?? "user"}</div>
                </div>
                <button
                  onClick={logout}
                  style={{ background: "transparent", border: "none", color: OPERIS_COLORS.textMuted, cursor: "pointer", padding: "0.25rem" }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <main style={{ flex: 1, padding: "1rem", paddingBottom: "5rem", color: OPERIS_COLORS.textPrimary, overflowY: "auto" }}>
          <PaywallGuard>{children}</PaywallGuard>
        </main>

        {/* Mobile Bottom Nav */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: OPERIS_COLORS.bgCard,
            borderTop: `1px solid ${OPERIS_COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            zIndex: 50,
          }}
        >
          {MOBILE_NAV.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.2rem",
                    padding: "0.375rem 0.75rem",
                    color: active ? OPERIS_COLORS.primary : OPERIS_COLORS.textMuted,
                    cursor: "pointer",
                  }}
                >
                  {item.icon}
                  <span
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: active ? 700 : 500,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
