import { trpc } from "@/lib/trpc";
import { useSaasAuth } from "@/contexts/SaasAuthContext";
import { OPERIS_COLORS } from "@/lib/operis-tokens";
import { Shield, Lock, ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";

/**
 * VistoriasPaywallGuard
 *
 * Módulo "Vistorias de Imóveis" é um Add-on independente.
 * Requer plano Pro (R$59/mês) ou Industrial (R$99/mês).
 * Plano Basic (R$29/mês) NÃO inclui este módulo.
 * Admins sempre têm acesso total.
 */
export default function VistoriasPaywallGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useSaasAuth();

  const { data: subscription, isLoading } = trpc.billing.getSubscription.useQuery(undefined, {
    enabled: !!user && !isAdmin,
    retry: false,
    staleTime: 60_000,
  });

  // Admins sempre passam
  if (isAdmin) return <>{children}</>;

  // Enquanto carrega, renderiza normalmente
  if (isLoading || !user) return <>{children}</>;

  // Planos que incluem Vistorias de Imóveis
  const plan = subscription?.plan;
  const status = subscription?.status;
  const hasAccess =
    (status === "active" || status === "trialing") &&
    (plan === "pro" || plan === "industrial");

  if (hasAccess) return <>{children}</>;

  // ─── Tela ACESSO RESTRITO ──────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: OPERIS_COLORS.bg,
      }}
    >
      {/* Ícone de cadeado */}
      <div
        style={{
          width: 80,
          height: 80,
          background: "rgba(200,16,46,0.08)",
          border: `2px solid ${OPERIS_COLORS.primary}`,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <Lock size={36} color={OPERIS_COLORS.primary} />
      </div>

      {/* Badge do módulo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(200,16,46,0.08)",
          border: `1px solid ${OPERIS_COLORS.primaryBorder}`,
          borderRadius: 4,
          padding: "0.375rem 0.875rem",
          marginBottom: "1rem",
        }}
      >
        <ClipboardCheck size={14} color={OPERIS_COLORS.primary} />
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: OPERIS_COLORS.primary,
          }}
        >
          Módulo Add-on
        </span>
      </div>

      {/* Título */}
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(1.5rem, 4vw, 2rem)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: OPERIS_COLORS.textPrimary,
          textAlign: "center",
          margin: "0 0 0.75rem 0",
        }}
      >
        ACESSO RESTRITO
      </h2>

      {/* Subtítulo */}
      <p
        style={{
          fontSize: "0.9375rem",
          color: OPERIS_COLORS.textSecondary,
          maxWidth: 520,
          lineHeight: 1.65,
          textAlign: "center",
          margin: "0 0 0.5rem 0",
        }}
      >
        O módulo <strong style={{ color: OPERIS_COLORS.textPrimary }}>Vistorias de Imóveis</strong> é um
        add-on disponível nos planos <strong style={{ color: OPERIS_COLORS.textPrimary }}>Pro</strong> e{" "}
        <strong style={{ color: OPERIS_COLORS.textPrimary }}>Industrial</strong>. Inclui vistorias
        cautelares, laudos com força jurídica (LC 214/2025), assinatura digital SHA-256 e geração de PDF
        blindado.
      </p>

      {/* Status atual */}
      {subscription && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.3rem 0.875rem",
            background: "rgba(200,16,46,0.06)",
            border: `1px solid ${OPERIS_COLORS.primary}`,
            color: OPERIS_COLORS.primary,
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "2rem",
            borderRadius: 2,
          }}
        >
          <Shield size={11} />
          {plan === "basic"
            ? "PLANO BASIC — SEM ACESSO A VISTORIAS"
            : status === "past_due"
            ? "⚠ PAGAMENTO EM ATRASO"
            : status === "canceled"
            ? "ASSINATURA CANCELADA"
            : "SEM ASSINATURA ATIVA"}
        </div>
      )}

      {/* Cards de planos */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          {
            id: "basic",
            name: "Basic",
            price: "R$ 29/mês",
            hasVistorias: false,
            current: plan === "basic",
          },
          {
            id: "pro",
            name: "Pro",
            price: "R$ 59/mês",
            hasVistorias: true,
            highlighted: true,
            current: plan === "pro",
          },
          {
            id: "industrial",
            name: "Industrial",
            price: "R$ 99/mês",
            hasVistorias: true,
            current: plan === "industrial",
          },
        ].map((p) => (
          <div
            key={p.id}
            style={{
              padding: "1.25rem 1.5rem",
              border: `2px solid ${p.highlighted ? OPERIS_COLORS.primary : OPERIS_COLORS.border}`,
              background: p.highlighted
                ? "rgba(200,16,46,0.06)"
                : OPERIS_COLORS.bgCard,
              minWidth: 140,
              position: "relative",
            }}
          >
            {p.highlighted && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: OPERIS_COLORS.primary,
                  color: "#fff",
                  fontSize: "0.5625rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "0.2rem 0.625rem",
                  whiteSpace: "nowrap",
                }}
              >
                Recomendado
              </div>
            )}
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "0.06em",
                color: p.highlighted ? OPERIS_COLORS.primary : OPERIS_COLORS.textPrimary,
                marginBottom: "0.25rem",
              }}
            >
              {p.name}
              {p.current && (
                <span
                  style={{
                    marginLeft: "0.375rem",
                    fontSize: "0.5625rem",
                    background: OPERIS_COLORS.primaryMuted,
                    color: OPERIS_COLORS.primary,
                    padding: "0.1rem 0.375rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Atual
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.875rem", color: OPERIS_COLORS.textSecondary, marginBottom: "0.75rem" }}>
              {p.price}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.75rem",
                color: p.hasVistorias ? OPERIS_COLORS.success : OPERIS_COLORS.textDisabled,
                fontWeight: p.hasVistorias ? 600 : 400,
              }}
            >
              {p.hasVistorias ? (
                <>
                  <CheckCircle2 size={13} color={OPERIS_COLORS.success} />
                  Vistorias incluídas
                </>
              ) : (
                <>
                  <Lock size={13} />
                  Sem Vistorias
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <a
          href="/app/assinatura"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.75rem",
            background: OPERIS_COLORS.primary,
            color: "#fff",
            textDecoration: "none",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          FAZER UPGRADE AGORA
          <ArrowRight size={15} />
        </a>
        <a
          href="/planos"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.75rem",
            background: "transparent",
            color: OPERIS_COLORS.textPrimary,
            textDecoration: "none",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: `2px solid ${OPERIS_COLORS.border}`,
          }}
        >
          VER PLANOS
        </a>
      </div>

      {/* Nota legal */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: OPERIS_COLORS.textDisabled,
          marginTop: "1.5rem",
          maxWidth: 420,
          lineHeight: 1.55,
          textAlign: "center",
        }}
      >
        Laudos com força jurídica (LC 214/2025 · Lei 8.245/91 · MP 2.200-2/2001) · Assinatura digital SHA-256 ·
        Eng. Judson Aleixo Sampaio · CREA/MG 142203671-5
      </p>
    </div>
  );
}
