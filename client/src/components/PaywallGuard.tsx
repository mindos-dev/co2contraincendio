import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";

// Rotas que NÃO precisam de assinatura ativa (sempre acessíveis após login)
const FREE_ROUTES = [
  "/app/assinatura",
  "/app/perfil",
  "/app/dashboard",
];

// Admins têm acesso total sem verificação de assinatura
const ADMIN_BYPASS = true;

interface PaywallGuardProps {
  children: React.ReactNode;
}

/**
 * PaywallGuard — Verifica se o usuário tem assinatura ativa antes de renderizar o conteúdo.
 * Se não tiver, exibe um banner de bloqueio com link para a página de planos.
 * Admins sempre têm acesso total.
 */
export default function PaywallGuard({ children }: PaywallGuardProps) {
  const [location] = useLocation();
  const { user, isAdmin } = useSaasAuth();

  const { data: subscription, isLoading } = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: !!user && !isAdmin,
    retry: false,
    staleTime: 60_000, // cache por 1 minuto
  });

  // Admins sempre passam
  if (ADMIN_BYPASS && isAdmin) return <>{children}</>;

  // Rotas gratuitas sempre passam
  const isFreeRoute = FREE_ROUTES.some(r => location.startsWith(r));
  if (isFreeRoute) return <>{children}</>;

  // Enquanto carrega, renderiza normalmente (evita flash de paywall)
  if (isLoading || !user) return <>{children}</>;

  // Verifica se tem assinatura ativa ou em trial
  const hasActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";

  if (hasActiveSubscription) return <>{children}</>;

  // Sem assinatura — exibe paywall
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      padding: "40px 20px",
      textAlign: "center",
    }}>
      {/* Ícone de cadeado */}
      <div style={{
        width: 72,
        height: 72,
        background: "#FFF0F0",
        border: "2px solid #C8102E",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        fontSize: 32,
      }}>
        🔒
      </div>

      {/* Título */}
      <h2 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800,
        fontSize: 28,
        letterSpacing: "0.04em",
        color: "#111111",
        margin: "0 0 12px 0",
        textTransform: "uppercase",
      }}>
        ACESSO RESTRITO
      </h2>

      {/* Subtítulo */}
      <p style={{
        fontSize: 15,
        color: "#4A4A4A",
        maxWidth: 480,
        lineHeight: 1.6,
        margin: "0 0 8px 0",
      }}>
        Esta funcionalidade requer uma assinatura ativa do OPERIS.
      </p>

      {/* Status da assinatura */}
      {subscription && (
        <div style={{
          display: "inline-block",
          padding: "4px 14px",
          background: "#FFF0F0",
          border: "1px solid #C8102E",
          color: "#C8102E",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 24,
        }}>
          {subscription.status === "past_due" ? "⚠️ PAGAMENTO EM ATRASO" :
           subscription.status === "canceled" ? "ASSINATURA CANCELADA" :
           subscription.status === "unpaid" ? "FATURA EM ABERTO" :
           "SEM ASSINATURA ATIVA"}
        </div>
      )}

      {/* Planos disponíveis resumidos */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 28,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {[
          { nome: "Basic", preco: "R$ 29/mês", destaque: false },
          { nome: "Pro", preco: "R$ 59/mês", destaque: true },
          { nome: "Industrial", preco: "R$ 99/mês", destaque: false },
        ].map(p => (
          <div key={p.nome} style={{
            padding: "12px 20px",
            border: `2px solid ${p.destaque ? "#C8102E" : "#D8D8D8"}`,
            background: p.destaque ? "#FFF0F0" : "#fff",
            minWidth: 120,
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.06em",
              color: p.destaque ? "#C8102E" : "#111111",
            }}>
              {p.nome}
            </div>
            <div style={{ fontSize: 13, color: "#4A4A4A", marginTop: 2 }}>{p.preco}</div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a
          href="/app/assinatura"
          style={{
            padding: "12px 28px",
            background: "#C8102E",
            color: "#fff",
            textDecoration: "none",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          VER MINHA ASSINATURA
        </a>
        <a
          href="/planos"
          style={{
            padding: "12px 28px",
            background: "transparent",
            color: "#111111",
            textDecoration: "none",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: "2px solid #111111",
          }}
        >
          CONHECER PLANOS
        </a>
      </div>

      {/* Nota legal */}
      <p style={{
        fontSize: 11,
        color: "#8A8A8A",
        marginTop: 24,
        maxWidth: 400,
        lineHeight: 1.5,
      }}>
        Teste grátis por 7 dias disponível. Cancele a qualquer momento.
        Dúvidas? Entre em contato via WhatsApp.
      </p>
    </div>
  );
}
