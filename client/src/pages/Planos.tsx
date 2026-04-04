import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield,
  Check,
  X,
  Zap,
  Building2,
  Factory,
  ArrowRight,
  Clock,
  CreditCard,
  Lock,
} from "lucide-react";

const planIcons: Record<string, React.ReactNode> = {
  basic: <Shield className="w-8 h-8 text-blue-400" />,
  pro: <Zap className="w-8 h-8 text-red-400" />,
  industrial: <Factory className="w-8 h-8 text-orange-400" />,
};

export default function Planos() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: plans = [] } = trpc.billing.listPlans.useQuery();

  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: ({ checkoutUrl }) => {
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
        toast.success("Redirecionando para o pagamento...", { description: "Uma nova aba foi aberta com o checkout seguro." });
      }
      setLoadingPlan(null);
    },
    onError: (err) => {
      toast.error("Erro ao iniciar pagamento", { description: err.message });
      setLoadingPlan(null);
    },
  });

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      setLocation(getLoginUrl());
      return;
    }
    setLoadingPlan(planId);
    createCheckout.mutate({
      planId: planId as "basic" | "pro" | "industrial",
      origin: window.location.origin,
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-zinc-950 to-zinc-900 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-800/50 rounded-full px-4 py-1.5 text-red-400 text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            7 dias grátis em todos os planos
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Escolha seu plano <span className="text-red-500">OPERIS</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Controle operacional completo para sistemas de combate a incêndio. Conformidade com ABNT NBR, alertas automáticos e laudos com IA.
          </p>
        </div>
      </section>

      {/* Planos */}
      <section className="bg-zinc-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? "border-red-500 bg-gradient-to-b from-red-950/40 to-zinc-900 shadow-2xl shadow-red-900/20 scale-105"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-red-600 text-white border-0 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="mb-3">{planIcons[plan.id]}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{plan.description}</p>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-zinc-500 text-sm">R$</span>
                    <span className="text-4xl font-black text-white">{plan.priceMonthly}</span>
                    <span className="text-zinc-500 text-sm mb-1">/mês</span>
                  </div>
                  <p className="text-zinc-600 text-xs mt-1">Cobrado mensalmente • Cancele quando quiser</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-700 mt-0.5 shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-zinc-300" : "text-zinc-600"}`}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full font-bold py-3 ${
                    plan.highlighted
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    "Aguarde..."
                  ) : (
                    <>
                      Começar agora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Garantias */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: <Clock className="w-6 h-6 text-green-400" />, title: "7 dias grátis", desc: "Teste sem compromisso, sem cartão obrigatório" },
              { icon: <CreditCard className="w-6 h-6 text-blue-400" />, title: "PIX e Cartão", desc: "Pagamento seguro via Stripe com suporte a PIX" },
              { icon: <Lock className="w-6 h-6 text-purple-400" />, title: "Cancele quando quiser", desc: "Sem fidelidade, sem multa de cancelamento" },
            ].map((g, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-6 rounded-xl bg-zinc-950 border border-zinc-800">
                {g.icon}
                <p className="font-semibold text-white text-sm">{g.title}</p>
                <p className="text-zinc-500 text-xs">{g.desc}</p>
              </div>
            ))}
          </div>

          {/* Teste com cartão */}
          <div className="mt-8 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
            <p className="text-zinc-500 text-sm">
              <span className="text-zinc-400 font-medium">Modo de teste:</span> Use o cartão{" "}
              <code className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 text-xs">4242 4242 4242 4242</code>{" "}
              com qualquer data futura e CVV para testar o pagamento.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
