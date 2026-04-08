/**
 * FireSystemPaywallGuard
 * Bloqueia acesso ao módulo Vistoria de Sistemas Fixos de Incêndio
 * para usuários sem plano Prêmio ou Industrial.
 * Admins têm acesso total (bypass).
 */
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { ShieldAlert, Flame, CheckCircle2, Lock, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FireSystemPaywallGuardProps {
  children: React.ReactNode;
}

const PLANS = [
  {
    name: "Básico",
    price: "R$ 197/mês",
    included: false,
    features: ["Equipamentos", "Manutenções", "QR Codes", "Alertas"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 397/mês",
    included: false,
    features: ["Tudo do Básico", "Vistorias de Imóveis", "Laudos", "Comparador"],
    highlight: false,
  },
  {
    name: "Prêmio",
    price: "R$ 697/mês",
    included: true,
    features: ["Tudo do Pro", "Sistemas Fixos de Incêndio", "NBR 14518", "Checklist 53 itens", "Logs de Auditoria"],
    highlight: true,
  },
  {
    name: "Industrial",
    price: "R$ 1.297/mês",
    included: true,
    features: ["Tudo do Prêmio", "Multi-empresa", "API", "Suporte prioritário", "Treinamento"],
    highlight: false,
  },
];

export function FireSystemPaywallGuard({ children }: FireSystemPaywallGuardProps) {
  const { user, isAdmin } = useSaasAuth();
  const { data: subscription, isLoading } = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: !!user && !isAdmin,
    retry: false,
    staleTime: 60_000,
  });

  // Admins têm acesso total
  if (isAdmin) return <>{children}</>;

  if (isLoading || !user) return <>{children}</>;

  const plan = subscription?.plan;
  const status = subscription?.status;
  const hasAccess =
    (status === "active" || status === "trialing") &&
    (plan === "industrial");

  if (hasAccess) return <>{children}</>;

  // ── Tela de ACESSO RESTRITO ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--operis-bg,#0A1628)] text-white p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <Flame className="h-7 w-7 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Vistoria de Sistemas Fixos de Incêndio</h1>
            <p className="text-slate-400 text-sm">NBR 14518:2019 · NBR 13714 · IT CBMMG · OPERIS IA</p>
          </div>
          <Badge className="ml-auto bg-orange-500/20 text-orange-300 border-orange-500/30 px-3 py-1">
            <Lock className="h-3 w-3 mr-1" />
            MÓDULO ADD-ON
          </Badge>
        </div>

        {/* Alerta */}
        <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-5 mb-8 flex items-start gap-4">
          <ShieldAlert className="h-6 w-6 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-300 mb-1">Acesso Restrito — Plano Prêmio ou Industrial</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              O módulo de Vistoria de Sistemas Fixos de Incêndio é um add-on exclusivo que inclui checklist normativo
              com 16 seções e 53 itens (coifas, filtros, dampers, dutos, exaustores, intertravamento), scoring de risco
              R1–R5, logs de auditoria rastreáveis e geração de laudo assinado pelo Eng. CREA/MG.
            </p>
          </div>
        </div>

        {/* Planos */}
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Escolha um plano para desbloquear</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-5 flex flex-col gap-3 transition-all ${
                plan.highlight
                  ? "border-orange-500 bg-orange-950/30 ring-1 ring-orange-500/50"
                  : "border-slate-700 bg-slate-800/40"
              }`}
            >
              {plan.highlight && (
                <Badge className="self-start bg-orange-500 text-white text-xs px-2 py-0.5">RECOMENDADO</Badge>
              )}
              <div>
                <p className="font-bold text-white text-lg">{plan.name}</p>
                <p className="text-slate-400 text-sm">{plan.price}</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 flex-shrink-0 ${plan.included ? "text-orange-400" : "text-slate-500"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.included ? (
                <Link href="/app/assinatura">
                  <Button
                    size="sm"
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold mt-2"
                  >
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Fazer upgrade
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-slate-600 text-slate-400 cursor-not-allowed mt-2"
                  disabled
                >
                  Não inclui este módulo
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Rodapé normativo */}
        <div className="border-t border-slate-700/50 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
            Módulo normativo: NBR 14518:2019 · NBR 13714 · NBR 17240 · NBR 10897 · IT-16/CBMMG · NFPA 17A.
            Eng. Judson Aleixo Sampaio — CREA/MG 142203671-5 · UL Listed.
          </p>
          <Link href="/planos">
            <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 whitespace-nowrap">
              Comparar todos os planos
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>

        </div>
      </div>
    </div>
  );
}
