import { HTMLAttributes } from "react";

type OperisCardAccent = "none" | "blue" | "green" | "yellow" | "red" | "purple";

interface OperisCardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: OperisCardAccent;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg";
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

interface OperisStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
  accent?: OperisCardAccent;
  loading?: boolean;
}

const ACCENT_COLORS: Record<OperisCardAccent, string> = {
  none:   "transparent",
  blue:   "#2563EB",
  green:  "#22C55E",
  yellow: "#EAB308",
  red:    "#EF4444",
  purple: "#8B5CF6",
};

const PAD: Record<"sm" | "md" | "lg", string> = {
  sm: "0.75rem",
  md: "1.25rem",
  lg: "1.75rem",
};

export function OperisCard({
  accent = "none",
  hoverable = false,
  padding = "md",
  header,
  footer,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: OperisCardProps) {
  const accentColor = ACCENT_COLORS[accent];
  const hasAccent = accent !== "none";

  const baseStyle: React.CSSProperties = {
    background: "#1A2332",
    border: `1px solid #2D3748`,
    borderRadius: "0.5rem",
    borderLeft: hasAccent ? `3px solid ${accentColor}` : "1px solid #2D3748",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
    transition: hoverable ? "background 0.15s, box-shadow 0.15s, transform 0.15s" : "none",
    overflow: "hidden",
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      (e.currentTarget as HTMLDivElement).style.background = "#1E293B";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.4)";
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      (e.currentTarget as HTMLDivElement).style.background = "#1A2332";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.3)";
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
    }
    onMouseLeave?.(e);
  };

  return (
    <div
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {header && (
        <div
          style={{
            padding: `0.875rem ${PAD[padding]}`,
            borderBottom: "1px solid #2D3748",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {header}
        </div>
      )}
      <div style={{ padding: PAD[padding] }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: `0.75rem ${PAD[padding]}`,
            borderTop: "1px solid #2D3748",
            background: "#111827",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export function OperisStatCard({
  label,
  value,
  unit,
  icon,
  trend,
  accent = "blue",
  loading = false,
}: OperisStatCardProps) {
  const accentColor = ACCENT_COLORS[accent];
  const trendPositive = trend && trend.value >= 0;

  return (
    <div
      style={{
        background: "#1A2332",
        border: "1px solid #2D3748",
        borderTop: `3px solid ${accentColor}`,
        borderRadius: "0.5rem",
        padding: "1.25rem",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#64748B",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
        {icon && (
          <span
            style={{
              color: accentColor,
              opacity: 0.8,
              display: "flex",
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div
          style={{
            height: "2rem",
            background: "#2D3748",
            borderRadius: "0.25rem",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
          <span
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              color: "#E2E8F0",
              lineHeight: 1,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: "0.875rem", color: "#64748B", fontWeight: 500 }}>
              {unit}
            </span>
          )}
        </div>
      )}

      {/* Trend */}
      {trend && (
        <div
          style={{
            marginTop: "0.625rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            fontSize: "0.75rem",
          }}
        >
          <span style={{ color: trendPositive ? "#22C55E" : "#EF4444", fontWeight: 600 }}>
            {trendPositive ? "▲" : "▼"} {Math.abs(trend.value)}%
          </span>
          {trend.label && (
            <span style={{ color: "#475569" }}>{trend.label}</span>
          )}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>
    </div>
  );
}

export default OperisCard;
