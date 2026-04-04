import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  XCircle,
  DollarSign,
  BarChart3,
  Shield,
  Zap,
  Factory,
} from "lucide-react";

export default function DashboardFinanceiro() {
  const { data: stats, isLoading } = trpc.billing.getFinancialDashboard.useQuery();

  const cards = stats
    ? [
        {
          label: "MRR (Receita Mensal)",
          value: `R$ ${stats.mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          icon: <DollarSign className="w-5 h-5 text-green-400" />,
          color: "border-green-800/50 bg-green-900/10",
          sub: "Receita recorrente mensal",
        },
        {
          label: "Clientes Ativos",
          value: stats.totalActive,
          icon: <Users className="w-5 h-5 text-blue-400" />,
          color: "border-blue-800/50 bg-blue-900/10",
          sub: `+ ${stats.totalTrialing} em trial`,
        },
        {
          label: "Ticket Médio",
          value: `R$ ${stats.avgTicket.toFixed(2)}`,
          icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
          color: "border-purple-800/50 bg-purple-900/10",
          sub: "Por cliente ativo",
        },
        {
          label: "Inadimplentes",
          value: stats.totalPastDue,
          icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
          color: "border-yellow-800/50 bg-yellow-900/10",
          sub: "Pagamento pendente",
        },
        {
          label: "Cancelados",
          value: stats.totalCanceled,
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          color: "border-red-800/50 bg-red-900/10",
          sub: "Assinaturas encerradas",
        },
        {
          label: "MRR Projetado",
          value: `R$ ${(stats.mrr * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          icon: <BarChart3 className="w-5 h-5 text-orange-400" />,
          color: "border-orange-800/50 bg-orange-900/10",
          sub: "Receita anual estimada",
        },
      ]
    : [];

  const planBreakdown = stats
    ? [
        { id: "basic", label: "Basic", count: stats.planBreakdown.basic, price: 29, icon: <Shield className="w-4 h-4 text-blue-400" />, color: "text-blue-400" },
        { id: "pro", label: "Pro", count: stats.planBreakdown.pro, price: 59, icon: <Zap className="w-4 h-4 text-red-400" />, color: "text-red-400" },
        { id: "industrial", label: "Industrial", count: stats.planBreakdown.industrial, price: 99, icon: <Factory className="w-4 h-4 text-orange-400" />, color: "text-orange-400" },
      ]
    : [];

  return (
    <SaasDashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Financeiro</h1>
          <p className="text-zinc-400 text-sm mt-1">Receita recorrente, clientes e inadimplência</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse h-28 bg-zinc-800 rounded-2xl" />
            ))}
          </div>
        ) : !stats ? (
          <div className="text-center py-16 text-zinc-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>Acesso restrito a administradores.</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cards.map((card, i) => (
                <div key={i} className={`rounded-2xl border p-5 ${card.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{card.label}</span>
                    {card.icon}
                  </div>
                  <p className="text-2xl font-black text-white">{card.value}</p>
                  <p className="text-zinc-500 text-xs mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Breakdown por plano */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">Distribuição por Plano</h2>
              <div className="space-y-4">
                {planBreakdown.map((plan) => {
                  const total = stats.totalActive || 1;
                  const pct = Math.round((plan.count / total) * 100);
                  const revenue = plan.count * plan.price;
                  return (
                    <div key={plan.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {plan.icon}
                          <span className="text-white text-sm font-medium">{plan.label}</span>
                          <span className="text-zinc-500 text-xs">{plan.count} clientes</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${plan.color}`}>
                            R$ {revenue.toLocaleString("pt-BR")}
                          </span>
                          <span className="text-zinc-600 text-xs ml-1">/mês</span>
                        </div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo de saúde */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Saúde da Base</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Taxa de Churn", value: stats.totalActive > 0 ? `${((stats.totalCanceled / (stats.totalActive + stats.totalCanceled)) * 100).toFixed(1)}%` : "0%", color: "text-red-400" },
                  { label: "Taxa de Inadimplência", value: stats.totalActive > 0 ? `${((stats.totalPastDue / stats.totalActive) * 100).toFixed(1)}%` : "0%", color: "text-yellow-400" },
                  { label: "Em Trial", value: stats.totalTrialing, color: "text-blue-400" },
                  { label: "Total de Assinaturas", value: stats.totalActive + stats.totalTrialing + stats.totalPastDue, color: "text-white" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-800/50">
                    <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                    <p className="text-zinc-500 text-xs mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </SaasDashboardLayout>
  );
}
