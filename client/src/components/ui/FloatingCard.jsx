const FloatingCard = ({ icon, title, subtitle, style, delay = 0, duration = 4 }) => (
  <div
    style={{
      position: "absolute",
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-raised)",
      padding: "10px 14px",
      animation: `card-float ${duration}s ease-in-out ${delay}s infinite`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
    <span>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--color-text)" }}>{title}</span>
      <span style={{ display: "block", fontSize: 11, color: "var(--color-text-muted)" }}>{subtitle}</span>
    </span>
  </div>
);

export default FloatingCard;
