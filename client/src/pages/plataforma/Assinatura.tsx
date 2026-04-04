import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import {
  Shield,
  Zap,
  Factory,
  Check,
  X,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Clock,
  RefreshCw,
} from "lucide-react";

const planIcons: Record<string, React.ReactNode> = {
  basic: <Shield className="w-6 h-6 text-blue-400" />,
  pro: <Zap className="w-6 h-6 text-red-400" />,
  industrial: <Factory className="w-6 h-6 text-orange-400" />,
  trial: <Clock className="w-6 h-6 text-zinc-400" />,
};

const statusLabels: Record<string, { label: string; color: string }> = {
  trialing: { label: "Trial Ativo", color: "bg-blue-900/40 text-blue-400 border-blue-800" },
  active: { label: "Ativo", color: "bg-green-900/40 text-green-400 border-green-800" },
  past_due: { label: "Pagamento Pendente", color: "bg-yellow-900/40 text-yellow-400 border-yellow-800" },
  canceled: { label: "Cancelado", color: "bg-zinc-800 text-zinc-400 border-zinc-700" },
  unpaid: { label: "Inadimplente", color: "bg-red-900/40 text-red-400 border-red-800" },
  paused: { label: "Pausado", color: "bg-zinc-800 text-zinc-400 border-zinc-700" },
};

export default function Assinatura() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: subscription, isLoading } = trpc.billing.getSubscription.useQuery();
  const { data: invoices = [] } = trpc.billing.getInvoices.useQuery();
  const { data: plans = [] } = trpc.billing.listPlans.useQuery();

  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: ({ checkoutUrl }) => {
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
        toast.success("Checkout aberto em nova aba");
      }
    },
    onError: (err) => toast.error("Erro ao iniciar pagamento", { description: err.message }),
  });

  const cancelSub = trpc.billing.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Assinatura cancelada ao final do período");
      utils.billing.getSubscription.invalidate();
    },
    onError: (err) => toast.error("Erro ao cancelar", { description: err.message }),
  });

  const handleUpgrade = (planId: string) => {
    createCheckout.mutate({ planId: planId as "basic" | "pro" | "industrial", origin: window.location.origin });
  };

  const statusInfo = subscription ? statusLabels[subscription.status] ?? statusLabels.canceled : null;

  return (
    <SaasDashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Assinatura</h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie seu plano e histórico de pagamentos</p>
        </div>

        {/* Status atual */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Plano Atual</h2>

          {isLoading ? (
            <div className="animate-pulse h-16 bg-zinc-800 rounded-xl" />
          ) : !subscription ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <Shield className="w-12 h-12 text-zinc-600" />
              <p className="text-zinc-400 text-sm">Você ainda não tem uma assinatura ativa.</p>
              <Button
                onClick={() => setLocation("/planos")}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Ver Planos <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                  {planIcons[subscription.plan] ?? planIcons.trial}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-lg capitalize">
                      {subscription.planDetails?.name ?? "Trial"}
                    </span>
                    {statusInfo && (
                      <Badge className={`border text-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Badge>
                    )}
                  </div>
                  {subscription.currentPeriodEnd && (
                    <p className="text-zinc-500 text-xs">
                      Próxima cobrança: {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {subscription.trialEndsAt && subscription.status === "trialing" && (
                    <p className="text-blue-400 text-xs">
                      Trial expira em: {new Date(subscription.trialEndsAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {(subscription.status === "past_due" || subscription.status === "unpaid") && (
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade(subscription.plan)}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Regularizar
                  </Button>
                )}
                {subscription.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Deseja cancelar sua assinatura ao final do período atual?")) {
                        cancelSub.mutate();
                      }
                    }}
                    className="border-zinc-700 text-zinc-400 hover:text-white"
                  >
                    Cancelar plano
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Alerta past_due */}
          {subscription?.status === "past_due" && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-yellow-300 text-xs">
                Seu pagamento está pendente. Regularize para manter o acesso ao OPERIS.
              </p>
            </div>
          )}
        </div>

        {/* Upgrade de plano */}
        {subscription && subscription.status === "active" && subscription.plan !== "industrial" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Fazer Upgrade</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans
                .filter((p) => {
                  const order = ["basic", "pro", "industrial"];
                  return order.indexOf(p.id) > order.indexOf(subscription.plan);
                })
                .map((plan) => (
                  <div key={plan.id} className="rounded-xl border border-zinc-700 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {planIcons[plan.id]}
                      <div>
                        <p className="text-white font-semibold text-sm">{plan.name}</p>
                        <p className="text-zinc-500 text-xs">R$ {plan.priceMonthly}/mês</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUpgrade(plan.id)}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs"
                    >
                      Upgrade
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Histórico de faturas */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Histórico de Pagamentos</h2>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">Nenhum pagamento registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${inv.status === "paid" ? "bg-green-400" : "bg-yellow-400"}`} />
                    <div>
                      <p className="text-white text-sm font-medium">
                        R$ {(inv.amountCents / 100).toFixed(2)}
                      </p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(inv.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${inv.status === "paid" ? "bg-green-900/40 text-green-400 border-green-800" : "bg-yellow-900/40 text-yellow-400 border-yellow-800"}`}>
                      {inv.status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                    {inv.hostedInvoiceUrl && (
                      <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-zinc-400 hover:text-white">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SaasDashboardLayout>
  );
}
