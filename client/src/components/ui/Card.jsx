const Card = ({ children, style, hoverable = false, ...props }) => (
  <div
    {...props}
    style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-card)",
      padding: 24,
      transition: hoverable ? "transform 0.2s ease, box-shadow 0.2s ease" : undefined,
      cursor: hoverable ? "pointer" : undefined,
      ...style,
    }}
    onMouseEnter={
      hoverable
        ? (e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "var(--shadow-raised)";
          }
        : undefined
    }
    onMouseLeave={
      hoverable
        ? (e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-card)";
          }
        : undefined
    }
  >
    {children}
  </div>
);

export default Card;
