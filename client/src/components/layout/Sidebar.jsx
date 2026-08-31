import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/assessment", label: "Assessment", icon: "✎" },
  { to: "/roadmap", label: "Roadmap", icon: "⟶" },
  { to: "/chat", label: "AI Assistant", icon: "◔" },
  { to: "/profile", label: "Profile", icon: "◍" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: isActive ? 600 : 500,
    color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
    background: isActive ? "rgba(79, 70, 229, 0.08)" : "transparent",
    transition: "background 0.15s ease, color 0.15s ease",
  });

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minHeight: "100vh",
        borderRight: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 24, cursor: "pointer" }}
        onClick={() => navigate("/dashboard")}
      >
        <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--color-gradient)" }} />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>CareerCompass</span>
      </div>

      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} style={linkStyle}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: -16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 18,
                    borderRadius: 2,
                    background: "var(--color-gradient)",
                  }}
                />
              )}
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16, padding: "16px 8px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</p>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 10 }}>{user?.email}</p>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
