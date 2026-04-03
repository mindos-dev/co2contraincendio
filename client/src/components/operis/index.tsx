/**
 * OPERIS Engineering Intelligence Platform
 * Base Component System — Industrial Dark Theme
 */

import React from "react";
import { OPERIS_COLORS, STATUS_COLORS } from "@/lib/operis-tokens";

// ─── OperisCard ────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  accent?: "blue" | "green" | "yellow" | "red" | "none";
  onClick?: () => void;
  hover?: boolean;
}

export function OperisCard({ children, style, accent = "none", onClick, hover = false }: CardProps) {
  const accentColors: Record<string, string> = {
    blue: OPERIS_COLORS.primary,
    green: OPERIS_COLORS.success,
    yellow: OPERIS_COLORS.warning,
    red: OPERIS_COLORS.danger,
    none: "transparent",
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: OPERIS_COLORS.bgCard,
        border: `1px solid ${OPERIS_COLORS.border}`,
        borderTop: accent !== "none" ? `2px solid ${accentColors[accent]}` : `1px solid ${OPERIS_COLORS.border}`,
        padding: "1.25rem 1.5rem",
        transition: hover ? "border-color 0.2s, background 0.2s" : undefined,
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = OPERIS_COLORS.borderLight;
        (e.currentTarget as HTMLDivElement).style.background = OPERIS_COLORS.bgHover;
      } : undefined}
      onMouseLeave={hover ? (e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = OPERIS_COLORS.border;
        (e.currentTarget as HTMLDivElement).style.background = OPERIS_COLORS.bgCard;
      } : undefined}
    >
      {children}
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
interface BadgeProps {
  status: string;
  size?: "sm" | "md";
  label?: string;
}

export function StatusBadge({ status, size = "md", label }: BadgeProps) {
  const config = STATUS_COLORS[status] ?? STATUS_COLORS.waiting;
  const displayLabel = label ?? config.label;
  const fontSize = size === "sm" ? "0.6875rem" : "0.75rem";
  const padding = size === "sm" ? "0.2rem 0.6rem" : "0.3rem 0.75rem";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        fontSize,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        padding,
        fontFamily: "'Inter', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: config.text,
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </span>
  );
}

// ─── KPIWidget ────────────────────────────────────────────────────────────────
interface KPIProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: number; label: string };
  accent?: "blue" | "green" | "yellow" | "red";
  icon?: React.ReactNode;
}

export function KPIWidget({ label, value, sub, trend, accent = "blue", icon }: KPIProps) {
  const accentColors: Record<string, string> = {
    blue: OPERIS_COLORS.primary,
    green: OPERIS_COLORS.success,
    yellow: OPERIS_COLORS.warning,
    red: OPERIS_COLORS.danger,
  };
  const color = accentColors[accent];
  const trendPositive = (trend?.value ?? 0) >= 0;

  return (
    <OperisCard accent={accent} style={{ position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `${color}18`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: OPERIS_COLORS.textMuted,
          }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color, opacity: 0.7 }}>{icon}</span>
        )}
      </div>
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "2.25rem",
          fontWeight: 800,
          color: OPERIS_COLORS.textPrimary,
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {sub && (
          <span style={{ fontSize: "0.8125rem", color: OPERIS_COLORS.textSecondary }}>{sub}</span>
        )}
        {trend && (
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: trendPositive ? OPERIS_COLORS.success : OPERIS_COLORS.danger,
            }}
          >
            {trendPositive ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </OperisCard>
  );
}

// ─── ChartContainer ───────────────────────────────────────────────────────────
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function ChartContainer({ title, subtitle, children, action, style }: ChartContainerProps) {
  return (
    <OperisCard style={style}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.9375rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: OPERIS_COLORS.textPrimary,
              marginBottom: "0.25rem",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: "0.75rem", color: OPERIS_COLORS.textMuted }}>{subtitle}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </OperisCard>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        textAlign: "center",
      }}
    >
      {icon && (
        <div style={{ color: OPERIS_COLORS.textMuted, marginBottom: "1rem", opacity: 0.5 }}>
          {icon}
        </div>
      )}
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "1.125rem",
          fontWeight: 700,
          color: OPERIS_COLORS.textSecondary,
          marginBottom: "0.5rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {description && (
        <p style={{ fontSize: "0.875rem", color: OPERIS_COLORS.textMuted, maxWidth: 320, lineHeight: 1.6, marginBottom: "1.25rem" }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, badge, action }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
      <div>
        {badge && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: OPERIS_COLORS.primary,
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ width: 16, height: 2, background: OPERIS_COLORS.primary, display: "inline-block" }} />
            {badge}
          </div>
        )}
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "1.625rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: OPERIS_COLORS.textPrimary,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "0.875rem", color: OPERIS_COLORS.textSecondary, marginTop: "0.375rem" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── ActionButton ─────────────────────────────────────────────────────────────
interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  icon?: React.ReactNode;
}

export function ActionButton({ children, onClick, variant = "primary", size = "md", disabled, type = "button", icon }: ActionButtonProps) {
  const sizes = {
    sm: { padding: "0.4rem 1rem", fontSize: "0.75rem" },
    md: { padding: "0.6rem 1.25rem", fontSize: "0.8125rem" },
    lg: { padding: "0.75rem 1.75rem", fontSize: "0.875rem" },
  };

  const variants = {
    primary: {
      background: OPERIS_COLORS.primary,
      color: "#fff",
      border: `1px solid ${OPERIS_COLORS.primary}`,
    },
    secondary: {
      background: "transparent",
      color: OPERIS_COLORS.textSecondary,
      border: `1px solid ${OPERIS_COLORS.border}`,
    },
    ghost: {
      background: "transparent",
      color: OPERIS_COLORS.textSecondary,
      border: "1px solid transparent",
    },
    danger: {
      background: "rgba(239,68,68,0.12)",
      color: OPERIS_COLORS.danger,
      border: `1px solid rgba(239,68,68,0.3)`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: "0.04em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        ...sizes[size],
        ...variants[variant],
      }}
    >
      {icon}
      {children}
    </button>
  );
}
