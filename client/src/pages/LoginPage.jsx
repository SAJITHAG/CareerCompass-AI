import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "var(--radius-sm)",
  border: "1.5px solid var(--color-border)",
  fontSize: 14,
  marginTop: 6,
  marginBottom: 18,
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 20px" }}>
        <Card style={{ width: 400 }}>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>
            Log in to see your career matches and roadmap.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="you@example.com"
              />
            </label>

            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 16 }}>{error}</p>
            )}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 20, textAlign: "center" }}>
            Don't have an account? <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Sign up</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
