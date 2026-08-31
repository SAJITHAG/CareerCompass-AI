import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import AICareerOrb from "../components/ui/AICareerOrb";

const STEPS = [
  { title: "Tell us about you", desc: "Skills, interests, education, and what you're aiming for — typed in, or lifted straight from a resume." },
  { title: "Get matched careers", desc: "A transparent score, not a guess — see exactly why each career fits, and by how much." },
  { title: "Close the gap", desc: "Real courses for your missing skills, pulled from an actual catalog, plus a roadmap to follow." },
];

// 623+ courses is real (matches the course catalog powering recommendations).
// "AI" and "∞" are intentionally qualitative, not counts — swapped in for the
// old "12 career paths" stat since the app doesn't cap career paths to 12.
const TRUST_STATS = [
  { value: "623+", label: "courses analyzed" },
  { value: "AI", label: "personalized guidance" },
  { value: "∞", label: "career possibilities" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <section
        className="bg-mesh"
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "88px 40px 64px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 56,
          alignItems: "center",
        }}
      >
        <div style={{ animation: "hero-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12.5,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--color-primary)",
              background: "rgba(79, 70, 229, 0.08)",
              border: "1px solid rgba(79, 70, 229, 0.14)",
              padding: "6px 14px",
              borderRadius: 999,
              marginBottom: 22,
              letterSpacing: "0.04em",
            }}
          >
            ✦ AI-Powered Career Discovery
          </span>

          <h1 style={{ fontSize: "clamp(34px, 4.6vw, 52px)", lineHeight: 1.08, marginBottom: 20, letterSpacing: "-0.02em" }}>
            Hi! I'm CareerCompass AI.
            <br />
            <span
              style={{
                background: "var(--color-gradient-vivid)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Find a career that actually fits.
            </span>
          </h1>

          <p style={{ fontSize: 17, color: "var(--color-text-muted)", marginBottom: 32, maxWidth: 480, lineHeight: 1.6 }}>
            Tell me your skills and interests — I'll match you to real careers, show exactly what's missing,
            and recommend real courses to close the gap. No guesswork, no invented advice.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
            <Button size="lg" onClick={() => navigate("/register")}>
              Start Career Assessment →
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works
            </Button>
          </div>

          <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginTop: -28, marginBottom: 40 }}>
            Free — takes about 2 minutes
          </p>

          <div style={{ display: "flex", gap: 32, animation: "hero-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both" }}>
            {TRUST_STATS.map((s) => (
              <div key={s.label}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "var(--color-text)" }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            animation: "hero-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
          }}
        >
          <AICareerOrb />
        </div>
      </section>

      <section id="how-it-works" style={{ maxWidth: 1140, margin: "0 auto", padding: "36px 40px 110px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {STEPS.map((step, i) => (
            <Card key={step.title} hoverable>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-primary)",
                  fontWeight: 600,
                  fontSize: 13,
                  background: "rgba(79, 70, 229, 0.07)",
                  padding: "3px 9px",
                  borderRadius: 6,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 style={{ fontSize: 18, margin: "14px 0 8px" }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.55 }}>{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
