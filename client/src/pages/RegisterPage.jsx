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

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      navigate("/assessment");
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
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>Create your account</h2>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 28 }}>
            Takes a minute — then straight into your career assessment.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Name
              <input required value={form.name} onChange={update("name")} style={inputStyle} placeholder="Your name" />
            </label>

            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                style={inputStyle}
                placeholder="you@example.com"
              />
            </label>

            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Password
              <input
                type="password"
                required
                value={form.password}
                onChange={update("password")}
                style={inputStyle}
                placeholder="At least 6 characters"
              />
            </label>

            {error && (
              <p style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 16 }}>{error}</p>
            )}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 20, textAlign: "center" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
