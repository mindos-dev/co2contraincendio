import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Bot, Zap, Shield, Brain, Globe, Lock, ChevronRight, Star } from "lucide-react";

interface EngePaywallGuardProps {
  children: React.ReactNode;
}

export function EngePaywallGuard({ children }: EngePaywallGuardProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: subscription } = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: !!user,
  });

  // Admins sempre têm acesso
  if (user?.role === "admin") return <>{children}</>;

  // Verificar se tem plano Enterprise/enge (acima do Pro)
  const plan = subscription?.plan ?? "free";
  const hasEngeAccess = ["enterprise", "enge", "industrial_plus", "industrial_enterprise"].includes(plan);

  if (hasEngeAccess) return <>{children}</>;

  // Tela de paywall OPERIS.enge
  return (
    <div className="min-h-screen bg-[#050D1A] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1a2744] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">OPERIS<span className="text-violet-400">.enge</span></span>
        <span className="ml-2 text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-medium">
          ENTERPRISE
        </span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
        {/* Lock icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/30 flex items-center justify-center mb-8">
          <Lock className="w-10 h-10 text-violet-400" />
        </div>

        <h1 className="text-4xl font-black mb-4 leading-tight">
          OPERIS<span className="text-violet-400">.enge</span>
          <br />
          <span className="text-2xl font-medium text-gray-400">Agente de Engenharia Autônomo</span>
        </h1>

        <p className="text-gray-400 text-lg mb-10 max-w-2xl leading-relaxed">
          O OPERIS.enge é um produto <strong className="text-white">exclusivo Enterprise</strong> — 
          um agente de IA autônomo que conecta múltiplos modelos (Claude, GPT-4, Gemini, Ollama) 
          e executa tarefas de engenharia em segundo plano, sem intervenção manual.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-3xl">
          {[
            {
              icon: Brain,
              title: "Multi-IA",
              desc: "Conecta Claude, GPT-4, Gemini, Ollama e qualquer API REST. Seleciona o melhor modelo por tarefa.",
              color: "from-violet-600/20 to-violet-800/10",
              border: "border-violet-500/30",
              iconColor: "text-violet-400",
            },
            {
              icon: Globe,
              title: "Browser Headless",
              desc: "Navega em portais do CREA, CBMMG, prefeituras e extrai dados em segundo plano — o cliente não vê nada.",
              color: "from-blue-600/20 to-blue-800/10",
              border: "border-blue-500/30",
              iconColor: "text-blue-400",
            },
            {
              icon: Shield,
              title: "Laudos Autônomos",
              desc: "Analisa documentos PDF/DWG, verifica conformidade normativa e gera laudos técnicos automaticamente.",
              color: "from-emerald-600/20 to-emerald-800/10",
              border: "border-emerald-500/30",
              iconColor: "text-emerald-400",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-xl p-5 text-left`}
            >
              <f.icon className={`w-6 h-6 ${f.iconColor} mb-3`} />
              <h3 className="font-bold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-10">
          {[
            {
              name: "Pro",
              price: "R$ 497/mês",
              features: ["Vistorias de Imóveis", "Sistemas Fixos", "Relatórios PDF", "Laudos técnicos"],
              hasEnge: false,
              current: plan === "pro",
            },
            {
              name: "Industrial",
              price: "R$ 997/mês",
              features: ["Tudo do Pro", "Multi-empresa", "API access", "Suporte prioritário"],
              hasEnge: false,
              current: plan === "industrial",
            },
            {
              name: "Enterprise",
              price: "Sob consulta",
              features: ["Tudo do Industrial", "OPERIS.enge ativo", "Agentes customizados", "SLA dedicado", "Onboarding técnico"],
              hasEnge: true,
              current: false,
              highlight: true,
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border p-5 text-left relative ${
                p.highlight
                  ? "border-violet-500 bg-gradient-to-br from-violet-600/20 to-blue-600/10"
                  : p.current
                  ? "border-gray-600 bg-[#0d1b2e]"
                  : "border-[#1a2744] bg-[#0a1628]"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> INCLUI OPERIS.enge
                </div>
              )}
              {p.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  SEU PLANO ATUAL
                </div>
              )}
              <h3 className={`font-black text-lg mb-1 ${p.highlight ? "text-violet-300" : "text-white"}`}>
                {p.name}
              </h3>
              <p className="text-2xl font-bold text-white mb-4">{p.price}</p>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${p.hasEnge && f.includes("enge") ? "bg-violet-600 text-white" : "bg-gray-700 text-gray-400"}`}>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 gap-2"
            onClick={() => navigate("/app/assinatura")}
          >
            <Zap className="w-4 h-4" />
            Fazer Upgrade para Enterprise
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8"
            onClick={() => navigate("/contato")}
          >
            Falar com Consultor
          </Button>
        </div>

        <p className="text-xs text-gray-600 mt-6">
          OPERIS.enge é um módulo vendido separadamente, não incluído nos planos Pro ou Industrial.
          Contate nossa equipe comercial para demonstração e proposta personalizada.
        </p>
      </div>
    </div>
  );
}
