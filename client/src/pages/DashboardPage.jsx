import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import MatchCircle from "../components/ui/MatchCircle";
import { useAuth } from "../hooks/useAuth";
import { getDashboard, getCareerById } from "../services/careerService";

// ---------------------------------------------------------------------
// Small presentational helpers, kept local to this page since they're
// only used here. Each answers one of the five orienting questions the
// dashboard is built around: Where am I? / Where am I going? / What's
// next? / How far along am I? / What have I done?
// ---------------------------------------------------------------------

const SkeletonDashboard = () => (
  <AppLayout>
    <div className="skeleton" style={{ width: 260, height: 30, marginBottom: 10 }} />
    <div className="skeleton" style={{ width: 380, height: 16, marginBottom: 28 }} />
    <div className="dash-grid" style={{ maxWidth: 920 }}>
      <div className="skeleton" style={{ height: 220 }} />
      <div className="dash-stat-rail">
        <div className="skeleton" style={{ height: 100 }} />
        <div className="skeleton" style={{ height: 100 }} />
      </div>
    </div>
  </AppLayout>
);

const StatRing = ({ percent, label, sublabel }) => (
  <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <MatchCircle percent={percent ?? 0} size={64} strokeWidth={6} />
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{sublabel}</p>
    </div>
  </Card>
);

// "Smart" next action derived from the top match's real missing-skill list
// (already computed server-side by careerMatchingService) — no invented data.
const NextActionCard = ({ topMatch, onSeeCareer }) => {
  if (!topMatch || !topMatch.missingSkills?.length) {
    return (
      <Card
        style={{
          background: "var(--color-gradient)",
          color: "#fff",
          border: "none",
        }}
      >
        <p className="dash-eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>
          Next best action
        </p>
        <p style={{ fontWeight: 600, fontSize: 15.5 }}>
          You're matching well across the board — explore another career to compare, or dive into your roadmap.
        </p>
      </Card>
    );
  }

  const nextSkill = topMatch.missingSkills[0];

  return (
    <Card
      style={{
        background: "var(--color-gradient)",
        color: "#fff",
        border: "none",
        boxShadow: "var(--shadow-glow)",
      }}
    >
      <p className="dash-eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>
        🎯 Your next best action
      </p>
      <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Build up: {nextSkill}</p>
      <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.88)", marginBottom: 16, lineHeight: 1.55 }}>
        You already have {topMatch.matchingSkills.slice(0, 3).join(", ") || "a solid base"}
        {topMatch.matchingSkills.length > 3 ? " and more" : ""}. {nextSkill} is the next gap keeping you from a
        stronger {topMatch.careerName} match.
      </p>
      <Button
        size="sm"
        variant="secondary"
        style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)" }}
        onClick={onSeeCareer}
      >
        See how it helps →
      </Button>
    </Card>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch(() => setError("Couldn't load your dashboard right now."))
      .finally(() => setLoading(false));
  }, []);

  const handleViewRoadmap = async () => {
    const top = dashboard.topMatches?.[0];
    if (!top) return;
    const career = await getCareerById(top.careerId);
    navigate("/roadmap", { state: { career, match: top } });
  };

  const goToTopCareer = () => {
    const top = dashboard?.topMatches?.[0];
    if (!top) return;
    navigate(`/careers/${top.careerId}`, { state: { match: top } });
  };

  if (loading) return <SkeletonDashboard />;

  if (error) {
    return (
      <AppLayout>
        <Card style={{ maxWidth: 480 }}>
          <p style={{ marginBottom: 12 }}>{error}</p>
          <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </Card>
      </AppLayout>
    );
  }

  if (!dashboard?.profileComplete) {
    return (
      <AppLayout>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Welcome, {user?.name?.split(" ")[0]}</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 28 }}>
          You haven't completed your career assessment yet.
        </p>
        <Card style={{ maxWidth: 480 }} className="bg-mesh">
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Take the 2-minute assessment to get your personalized career matches, skill gaps, and course
            recommendations.
          </p>
          <Button onClick={() => navigate("/assessment")}>Start Career Assessment</Button>
        </Card>
      </AppLayout>
    );
  }

  const topMatch = dashboard.topMatches?.[0];
  const otherMatches = dashboard.topMatches?.slice(1) ?? [];

  return (
    <AppLayout>
      <div style={{ animation: "hero-fade-up 0.4s ease both" }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 28, fontSize: 15 }}>
          Here's where you stand{dashboard.careerGoal ? ` on your path to ${dashboard.careerGoal}` : ""}.
        </p>

        <div className="dash-grid" style={{ maxWidth: 920, marginBottom: 24 }}>
          {/* ---- Where am I? -------------------------------------------------- */}
          <Card className="bg-mesh">
            <p className="dash-eyebrow">Where am I?</p>
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: topMatch ? 18 : 0 }}>
              {topMatch && <MatchCircle percent={topMatch.matchPercentage} size={104} label="Top match" />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 22, marginBottom: 6 }}>{topMatch?.careerName ?? "No match yet"}</h2>
                <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                  {topMatch?.reason?.[0]}
                </p>
              </div>
            </div>

            {topMatch && (
              <>
                <div className="dash-chip-row" style={{ marginBottom: 10 }}>
                  {topMatch.matchingSkills.slice(0, 6).map((s) => (
                    <Badge key={s} tone="success">
                      ✓ {s}
                    </Badge>
                  ))}
                </div>
                {topMatch.missingSkills.length > 0 && (
                  <div className="dash-chip-row" style={{ marginBottom: 18 }}>
                    {topMatch.missingSkills.slice(0, 4).map((s) => (
                      <Badge key={s} tone="warning">
                        → {s}
                      </Badge>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <Button size="sm" onClick={goToTopCareer}>
                    View details
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleViewRoadmap}>
                    View roadmap
                  </Button>
                </div>
              </>
            )}
          </Card>

          {/* ---- What's next? / How far along am I? --------------------------- */}
          <div className="dash-stat-rail">
            <NextActionCard topMatch={topMatch} onSeeCareer={goToTopCareer} />
            <StatRing
              percent={dashboard.roadmapCompletionPercent ?? 0}
              label="Roadmap progress"
              sublabel="How far along am I?"
            />
            <StatRing
              percent={
                dashboard.skillsProgress?.total
                  ? Math.round((dashboard.skillsProgress.known / dashboard.skillsProgress.total) * 100)
                  : 0
              }
              label={
                dashboard.skillsProgress
                  ? `${dashboard.skillsProgress.known}/${dashboard.skillsProgress.total} skills`
                  : "Skills"
              }
              sublabel="What have I achieved?"
            />
          </div>
        </div>

        {/* ---- What have I achieved? (secondary stats) ------------------------- */}
        <div style={{ display: "flex", gap: 14, maxWidth: 920, marginBottom: 28, flexWrap: "wrap" }}>
          <Card style={{ flex: "1 1 200px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--color-primary)" }}>
              {dashboard.coursesRecommendedCount ?? 0}
            </p>
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 4 }}>Courses recommended</p>
          </Card>
          <Card style={{ flex: "1 1 200px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--color-primary)" }}>
              {dashboard.topMatches?.length ?? 0}
            </p>
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 4 }}>Careers matched</p>
          </Card>
        </div>

        {/* ---- Other matches ---------------------------------------------------- */}
        {otherMatches.length > 0 && (
          <>
            <p className="dash-eyebrow">Where else could I go?</p>
            <div className="dash-other-matches" style={{ maxWidth: 920, marginBottom: 8 }}>
              {otherMatches.map((m) => (
                <Card
                  key={m.careerId}
                  hoverable
                  style={{
                    flex: "0 0 220px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                  onClick={() => navigate(`/careers/${m.careerId}`, { state: { match: m } })}
                >
                  <MatchCircle percent={m.matchPercentage} size={52} strokeWidth={5} />
                  <p style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{m.careerName}</p>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
