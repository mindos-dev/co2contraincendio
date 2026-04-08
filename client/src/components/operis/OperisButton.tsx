import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type OperisButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type OperisButtonSize = "sm" | "md" | "lg";

interface OperisButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: OperisButtonVariant;
  size?: OperisButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_STYLES: Record<OperisButtonVariant, React.CSSProperties> = {
  primary: {
    background: "#2563EB",
    color: "#FFFFFF",
    border: "1px solid transparent",
  },
  secondary: {
    background: "#1E293B",
    color: "#E2E8F0",
    border: "1px solid #334155",
  },
  outline: {
    background: "transparent",
    color: "#94A3B8",
    border: "1px solid #334155",
  },
  danger: {
    background: "#DC2626",
    color: "#FFFFFF",
    border: "1px solid transparent",
  },
  ghost: {
    background: "transparent",
    color: "#64748B",
    border: "1px solid transparent",
  },
};

const HOVER_STYLES: Record<OperisButtonVariant, React.CSSProperties> = {
  primary:   { background: "#1D4ED8" },
  secondary: { background: "#243044", borderColor: "#475569" },
  outline:   { background: "#1E293B", color: "#E2E8F0" },
  danger:    { background: "#B91C1C" },
  ghost:     { background: "#1E293B", color: "#94A3B8" },
};

const SIZE_STYLES: Record<OperisButtonSize, React.CSSProperties> = {
  sm: { padding: "0.375rem 0.75rem",  fontSize: "0.8125rem", gap: "0.375rem", height: "2rem" },
  md: { padding: "0.5rem 1rem",       fontSize: "0.875rem",  gap: "0.5rem",   height: "2.25rem" },
  lg: { padding: "0.625rem 1.25rem",  fontSize: "0.9375rem", gap: "0.5rem",   height: "2.5rem" },
};

const OperisButton = forwardRef<HTMLButtonElement, OperisButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
      letterSpacing: "0.01em",
      borderRadius: "0.375rem",
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      transition: "background 0.12s ease, border-color 0.12s ease, color 0.12s ease, opacity 0.12s ease",
      whiteSpace: "nowrap",
      userSelect: "none",
      outline: "none",
      ...VARIANT_STYLES[variant],
      ...SIZE_STYLES[size],
      ...style,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        Object.assign(e.currentTarget.style, HOVER_STYLES[variant]);
      }
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        Object.assign(e.currentTarget.style, VARIANT_STYLES[variant]);
      }
      onMouseLeave?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={baseStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading ? (
          <Loader2 size={14} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
        ) : leftIcon ? (
          <span style={{ flexShrink: 0, display: "flex" }}>{leftIcon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {!loading && rightIcon && (
          <span style={{ flexShrink: 0, display: "flex" }}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

OperisButton.displayName = "OperisButton";

export default OperisButton;
export type { OperisButtonVariant, OperisButtonSize, OperisButtonProps };
