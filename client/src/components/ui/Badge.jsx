const TONE_STYLES = {
  neutral: { background: "var(--color-bg)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" },
  primary: { background: "rgba(79, 70, 229, 0.1)", color: "var(--color-primary)", border: "1px solid rgba(79, 70, 229, 0.2)" },
  success: { background: "rgba(16, 185, 129, 0.1)", color: "#047857", border: "1px solid rgba(16, 185, 129, 0.2)" },
  warning: { background: "rgba(245, 158, 11, 0.1)", color: "#B45309", border: "1px solid rgba(245, 158, 11, 0.2)" },
};

const Badge = ({ children, tone = "neutral", onRemove }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 12px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 500,
      ...TONE_STYLES[tone],
    }}
  >
    {children}
    {onRemove && (
      <button
        onClick={onRemove}
        aria-label={`Remove ${children}`}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          padding: 0,
          fontSize: 14,
          lineHeight: 1,
          opacity: 0.6,
        }}
      >
        &times;
      </button>
    )}
  </span>
);

export default Badge;
