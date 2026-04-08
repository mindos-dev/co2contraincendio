/**
 * OPERIS.eng — Painel Principal
 * Design: Procore/Autodesk — dark navy (#0a1628), accent #f97316, Barlow Condensed
 * Produto Enterprise — 4 Motores de IA para Engenharia de Incêndio
 */
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain, TrendingUp, ShoppingCart, Globe, Shield,
  CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Cpu, Zap, BookOpen, Activity
} from "lucide-react";

// ─── Tokens de Design OPERIS.eng ─────────────────────────────────────────────
const ENG_COLORS = {
  bg: "#0a1628",
  surface: "#0f2040",
  border: "#1e3a5f",
  accent: "#f97316",
  accentDim: "#f9731620",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

// ─── Card de Motor ────────────────────────────────────────────────────────────
function MotorCard({
  icon: Icon,
  title,
  subtitle,
  stats,
  href,
  accentColor = ENG_COLORS.accent,
  status = "active",
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  stats: Array<{ label: string; value: string | number }>;
  href: string;
  accentColor?: string;
  status?: "active" | "idle" | "learning";
}) {
  const statusConfig = {
    active: { label: "Ativo", color: ENG_COLORS.success, dot: "bg-green-500" },
    idle: { label: "Aguardando", color: ENG_COLORS.warning, dot: "bg-yellow-500" },
    learning: { label: "Aprendendo", color: "#60a5fa", dot: "bg-blue-400" },
  };
  const sc = statusConfig[status];

  return (
    <Link href={href}>
      <div
        className="group relative rounded-xl border p-5 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: `linear-gradient(135deg, ${ENG_COLORS.surface} 0%, ${ENG_COLORS.bg} 100%)`,
          borderColor: ENG_COLORS.border,
        }}
      >
        {/* Accent line top */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
          style={{ background: accentColor }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
            >
              <Icon className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: ENG_COLORS.text, fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", letterSpacing: "0.02em" }}>
                {title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: ENG_COLORS.textMuted }}>{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
            <span className="text-xs" style={{ color: sc.color }}>{sc.label}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-lg p-2.5" style={{ background: `${ENG_COLORS.bg}80`, border: `1px solid ${ENG_COLORS.border}` }}>
              <div className="text-xs mb-0.5" style={{ color: ENG_COLORS.textMuted }}>{s.label}</div>
              <div className="font-bold text-sm" style={{ color: ENG_COLORS.text, fontFamily: "'Barlow Condensed', sans-serif" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: ENG_COLORS.textMuted }}>Acessar módulo</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: accentColor }} />
        </div>
      </div>
    </Link>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function OperisEngHome() {
  const { data: status, isLoading } = trpc.enge.getStatus.useQuery(undefined, {
    retry: false,
  });

  const isEnterprise = !isLoading && !!status;

  const motors = status?.motors;
  const govStats = motors?.governance;
  const learningStats = motors?.selfLearning;
  const commercialStats = motors?.commercial;
  const operationalStats = motors?.operational;

  return (
    <SaasDashboardLayout>
      <div className="p-6 space-y-6" style={{ background: ENG_COLORS.bg, minHeight: "100vh" }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ENG_COLORS.accent}20`, border: `1px solid ${ENG_COLORS.accent}40` }}>
                <Cpu className="w-4 h-4" style={{ color: ENG_COLORS.accent }} />
              </div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 700, color: ENG_COLORS.text, letterSpacing: "0.04em" }}>
                OPERIS<span style={{ color: ENG_COLORS.accent }}>.eng</span>
              </h1>
              <Badge className="text-xs px-2 py-0.5 rounded-sm" style={{ background: `${ENG_COLORS.accent}20`, color: ENG_COLORS.accent, border: `1px solid ${ENG_COLORS.accent}40` }}>
                Enterprise
              </Badge>
            </div>
            <p className="text-sm" style={{ color: ENG_COLORS.textMuted }}>
              Agente de Engenharia Autônomo — 4 Motores de IA para Proteção Contra Incêndio
            </p>
          </div>

          {isEnterprise && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs" style={{ color: ENG_COLORS.success }}>Sistema Operacional</span>
            </div>
          )}
        </div>

        {/* ── Paywall / Loading ─────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <Activity className="w-8 h-8 mx-auto animate-pulse" style={{ color: ENG_COLORS.accent }} />
              <p className="text-sm" style={{ color: ENG_COLORS.textMuted }}>Inicializando motores...</p>
            </div>
          </div>
        )}

        {!isLoading && !isEnterprise && (
          <div className="rounded-xl border p-8 text-center" style={{ background: ENG_COLORS.surface, borderColor: ENG_COLORS.border }}>
            <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: ENG_COLORS.accent }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: ENG_COLORS.text, fontFamily: "'Barlow Condensed', sans-serif" }}>
              OPERIS.eng requer Plano Enterprise
            </h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: ENG_COLORS.textMuted }}>
              O OPERIS.eng é um produto de engenharia autônoma com 4 motores de IA especializados em sistemas de proteção contra incêndio. Disponível no plano Enterprise.
            </p>
            <Link href="/app/assinatura">
              <Button style={{ background: ENG_COLORS.accent, color: "#fff", border: "none" }}>
                Fazer Upgrade para Enterprise
              </Button>
            </Link>
          </div>
        )}

        {/* ── 4 Motores ─────────────────────────────────────────────────────── */}
        {isEnterprise && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Motor 1: Autoaprendizagem */}
              <MotorCard
                icon={Brain}
                title="Motor de Autoaprendizagem"
                subtitle="Aprende com orçamentos, propostas e portais"
                accentColor="#60a5fa"
                status={learningStats?.totalBudgets ? "learning" : "idle"}
                href="/app/operis-eng/aprendizagem"
                stats={[
                  { label: "Orçamentos Aprendidos", value: learningStats?.totalBudgets ?? 0 },
                  { label: "Taxa de Aprovação", value: `${learningStats?.approvalRate ?? 0}%` },
                  { label: "Propostas Vencidas", value: learningStats?.wonProposals ?? 0 },
                  { label: "Margem Média", value: `${learningStats?.avgApprovedMargin ?? 0}%` },
                ]}
              />

              {/* Motor 2: Comercial */}
              <MotorCard
                icon={ShoppingCart}
                title="Motor Comercial"
                subtitle="Orçamentos, propostas, follow-up e fornecedores"
                accentColor={ENG_COLORS.accent}
                status={commercialStats?.totalBudgets ? "active" : "idle"}
                href="/app/operis-eng/comercial"
                stats={[
                  { label: "Total de Orçamentos", value: commercialStats?.totalBudgets ?? 0 },
                  { label: "Aprovados", value: commercialStats?.approvedBudgets ?? 0 },
                  { label: "Conversão", value: `${commercialStats?.conversionRate ?? 0}%` },
                  { label: "Receita Total", value: `R$ ${((commercialStats?.totalRevenue ?? 0) / 1000).toFixed(1)}k` },
                ]}
              />

              {/* Motor 3: Operacional */}
              <MotorCard
                icon={Globe}
                title="Motor Operacional Assistido"
                subtitle="Sessões autenticadas em portais CREA, NF-e, gov.br"
                accentColor="#a78bfa"
                status={operationalStats?.activeSessions ? "active" : "idle"}
                href="/app/operis-eng/operacional"
                stats={[
                  { label: "Sessões Ativas", value: operationalStats?.activeSessions ?? 0 },
                  { label: "Tarefas Concluídas", value: operationalStats?.completedTasks ?? 0 },
                  { label: "Portais Suportados", value: operationalStats?.supportedPortals ?? 0 },
                  { label: "Aguardando Conf.", value: operationalStats?.blockedTasks ?? 0 },
                ]}
              />

              {/* Motor 4: Governança */}
              <MotorCard
                icon={Shield}
                title="Motor de Governança"
                subtitle="Auditoria imutável, permissões e confirmações humanas"
                accentColor="#22c55e"
                status="active"
                href="/app/operis-eng/governanca"
                stats={[
                  { label: "Logs de Auditoria", value: govStats?.totalAuditEntries ?? 0 },
                  { label: "Regras Ativas", value: govStats?.rules ?? 0 },
                  { label: "Conf. Pendentes", value: govStats?.pendingConfirmations ?? 0 },
                  { label: "Integridade", value: govStats?.chainValid ? "✓ OK" : "Verificar" },
                ]}
              />
            </div>

            {/* ── Acesso Rápido ──────────────────────────────────────────────── */}
            <div className="rounded-xl border p-5" style={{ background: ENG_COLORS.surface, borderColor: ENG_COLORS.border }}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: ENG_COLORS.textMuted, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Acesso Rápido
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: TrendingUp, label: "Novo Orçamento", href: "/app/operis-eng/comercial/novo", color: ENG_COLORS.accent },
                  { icon: Globe, label: "Nova Sessão Portal", href: "/app/operis-eng/operacional/nova-sessao", color: "#a78bfa" },
                  { icon: BookOpen, label: "Registrar Aprendizado", href: "/app/operis-eng/aprendizagem/registrar", color: "#60a5fa" },
                  { icon: Zap, label: "Log de Auditoria", href: "/app/operis-eng/governanca/auditoria", color: "#22c55e" },
                ].map((item, i) => (
                  <Link key={i} href={item.href}>
                    <div
                      className="flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: `${item.color}10`, border: `1px solid ${item.color}30` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      <span className="text-xs text-center" style={{ color: ENG_COLORS.textMuted }}>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Aviso Legal ───────────────────────────────────────────────── */}
            <div className="rounded-lg border p-4 flex items-start gap-3" style={{ background: `${ENG_COLORS.accent}08`, borderColor: `${ENG_COLORS.accent}30` }}>
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ENG_COLORS.accent }} />
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: ENG_COLORS.accent }}>Protocolo de Segurança OPERIS.eng</p>
                <p className="text-xs" style={{ color: ENG_COLORS.textMuted }}>
                  Ações sensíveis (submissão de formulários, pagamentos, assinaturas digitais) são sempre bloqueadas e requerem confirmação humana explícita. O agente opera apenas em modo de leitura, rascunho e download por padrão.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </SaasDashboardLayout>
  );
}
