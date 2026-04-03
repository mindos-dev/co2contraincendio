import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, ExternalLink } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
  badge?: string;
}

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacidade" },
  { href: "/legal/terms", label: "Termos de Uso" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/security", label: "Segurança" },
  { href: "/legal/compliance", label: "Compliance" },
];

export default function LegalLayout({ title, subtitle, lastUpdated, children, badge }: LegalLayoutProps) {
  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#9CA3AF", textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={14} />
          CO₂ Contra Incêndio
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: "#C8102E", color: "#fff", fontWeight: 900, fontSize: 11, padding: "3px 8px", letterSpacing: 2 }}>OPERIS</span>
          <span style={{ color: "#6B7280", fontSize: 12 }}>Documentação Legal</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: "#111", padding: "48px 24px 40px", borderBottom: "1px solid #1F2937" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {badge && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(200,16,46,0.15)", border: "1px solid rgba(200,16,46,0.3)", borderRadius: 20, padding: "4px 12px", marginBottom: 16 }}>
              <Shield size={12} color="#C8102E" />
              <span style={{ fontSize: 11, color: "#C8102E", fontWeight: 600, letterSpacing: 1 }}>{badge}</span>
            </div>
          )}
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.2 }}>{title}</h1>
          <p style={{ fontSize: 15, color: "#9CA3AF", margin: "0 0 16px" }}>{subtitle}</p>
          <p style={{ fontSize: 12, color: "#6B7280" }}>Última atualização: {lastUpdated}</p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {LEGAL_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "14px 20px", fontSize: 13, fontWeight: 500,
                color: typeof window !== "undefined" && window.location.pathname === link.href ? "#C8102E" : "#6B7280",
                textDecoration: "none", borderBottom: typeof window !== "undefined" && window.location.pathname === link.href ? "2px solid #C8102E" : "2px solid transparent",
                whiteSpace: "nowrap", transition: "color 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ background: "#111", borderTop: "1px solid #1F2937", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>
          CO₂ Contra Incêndio LTDA — CNPJ 29.905.123/0001-53 — Belo Horizonte, MG
          {" · "}
          <a href="mailto:co2contraincendio@gmail.com" style={{ color: "#9CA3AF", textDecoration: "none" }}>co2contraincendio@gmail.com</a>
          {" · "}
          <a href="tel:+5531997383115" style={{ color: "#9CA3AF", textDecoration: "none" }}>(31) 9 9738-3115</a>
        </p>
      </div>
    </div>
  );
}

// Shared section component
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 12px", paddingBottom: 8, borderBottom: "2px solid #F3F4F6" }}>{title}</h2>
      <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

export function LegalTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", marginTop: 12, marginBottom: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F9FAFB" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #E5E7EB", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #F3F4F6", background: ri % 2 === 0 ? "#fff" : "#FAFAFA" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "10px 14px", color: "#4B5563", verticalAlign: "top" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalHighlight({ children, type = "info" }: { children: ReactNode; type?: "info" | "warning" | "success" }) {
  const colors = {
    info: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
    success: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
  };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "14px 18px", margin: "16px 0", fontSize: 13, color: c.text, lineHeight: 1.7 }}>
      {children}
    </div>
  );
}
