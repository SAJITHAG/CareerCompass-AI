import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Assessment", to: "/assessment" },
  { label: "My Results", to: "/results" },
];

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "14px 40px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "var(--color-gradient)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
          </svg>
        </span>
        <span style={{ lineHeight: 1.15 }}>
          <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
            CareerCompass AI
          </span>
          <span style={{ display: "block", fontSize: 10.5, color: "var(--color-text-muted)", fontWeight: 500 }}>
            AI Career Guidance
          </span>
        </span>
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {NAV_LINKS.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontWeight: 600,
                fontSize: 14,
                padding: "8px 16px",
                borderRadius: 999,
                color: active ? "var(--color-primary)" : "var(--color-text-muted)",
                background: active ? "rgba(124, 58, 237, 0.1)" : "transparent",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <ThemeToggle />

        <Button
          size="sm"
          variant="secondary"
          style={{ background: "var(--color-text)", color: "var(--color-bg)", border: "none" }}
          onClick={() => navigate(isAuthenticated ? "/chat" : "/register")}
        >
          ✨ AI Mentor
        </Button>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard" style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-muted)" }}>
              Dashboard
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-muted)" }}>
              Log in
            </Link>
            <Button size="sm" onClick={() => navigate("/register")}>
              Get started
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
