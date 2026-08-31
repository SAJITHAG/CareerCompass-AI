const VARIANT_STYLES = {
  primary: {
    background: "var(--color-gradient)",
    color: "#fff",
    border: "none",
  },
  secondary: {
    background: "var(--color-surface)",
    color: "var(--color-primary)",
    border: "1.5px solid var(--color-border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-muted)",
    border: "none",
  },
};

const Button = ({ children, variant = "primary", size = "md", fullWidth = false, style, ...props }) => {
  const padding = size === "lg" ? "14px 28px" : size === "sm" ? "8px 16px" : "11px 22px";
  const fontSize = size === "lg" ? 16 : 14;

  return (
    <button
      {...props}
      style={{
        ...VARIANT_STYLES[variant],
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: "var(--radius-sm)",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        width: fullWidth ? "100%" : "auto",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        boxShadow: variant === "primary" ? "0 4px 14px rgba(79, 70, 229, 0.28)" : "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          e.currentTarget.style.transform = "translateY(-1px)";
          if (variant === "primary") e.currentTarget.style.boxShadow = "var(--shadow-glow)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        if (variant === "primary") e.currentTarget.style.boxShadow = "0 4px 14px rgba(79, 70, 229, 0.28)";
      }}
    >
      {children}
    </button>
  );
};

export default Button;
