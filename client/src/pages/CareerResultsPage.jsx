import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import MatchCircle from "../components/ui/MatchCircle";
import { buildJobSearchUrl, getJobPortalName, isFullyQualified } from "../utils/jobPortal";
import { analyzeCustomCareer } from "../services/careerService";

const MAX_COMPARE = 3;

const CareerResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const matches = location.state?.matches;
  const studentProfile = location.state?.studentProfile;
  const [selected, setSelected] = useState([]);

  const [customCareerName, setCustomCareerName] = useState("");
  const [customSubmitting, setCustomSubmitting] = useState(false);
  const [customError, setCustomError] = useState("");

  const handleCustomCareerSubmit = async (e) => {
    e.preventDefault();
    setCustomError("");

    if (!customCareerName.trim()) return;
    if (!studentProfile) {
      setCustomError("We lost track of your profile — please run the assessment again.");
      return;
    }

    setCustomSubmitting(true);
    try {
      const result = await analyzeCustomCareer(customCareerName.trim(), studentProfile);
      navigate(`/careers/${result.match.careerId || "custom"}`, {
        state: { match: result.match, career: result.career, isCustom: result.source === "ai-generated" },
      });
    } catch (err) {
      setCustomError(
        err.response?.data?.message || "Couldn't analyze that career right now. Please try again."
      );
    } finally {
      setCustomSubmitting(false);
    }
  };

  if (!matches || matches.length === 0) {
    return (
      <AppLayout>
        <Card style={{ maxWidth: 480 }}>
          <p style={{ marginBottom: 16 }}>
            No results to show yet — run the career assessment first to see your matches.
          </p>
          <Button onClick={() => navigate("/assessment")}>Go to Assessment</Button>
        </Card>
      </AppLayout>
    );
  }

  const toggleSelected = (careerId) => {
    setSelected((prev) => {
      if (prev.includes(careerId)) return prev.filter((id) => id !== careerId);
      if (prev.length >= MAX_COMPARE) return prev; // silently ignore past the cap
      return [...prev, careerId];
    });
  };

  const handleCompare = () => {
    const selectedMatches = matches.filter((m) => selected.includes(m.careerId));
    navigate("/compare", { state: { matches: selectedMatches } });
  };

  return (
    <AppLayout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Your Career Matches</h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            Ranked by fit, based on your skills, interests, goals, and experience.
          </p>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>
        Select 2–{MAX_COMPARE} careers below to compare them side by side.
      </p>

      <Card style={{ maxWidth: 720, marginBottom: 24, background: "rgba(79, 70, 229, 0.03)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Don't see the career you had in mind?</p>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 14 }}>
          Type any career and we'll score it against your profile the same way — using real skills from our course
          dataset, not a made-up percentage.
        </p>
        <form onSubmit={handleCustomCareerSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={customCareerName}
            onChange={(e) => setCustomCareerName(e.target.value)}
            placeholder="e.g. Site Reliability Engineer"
            style={{
              flex: "1 1 260px",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--color-border)",
              fontSize: 14,
            }}
          />
          <Button type="submit" size="sm" disabled={customSubmitting || !customCareerName.trim()}>
            {customSubmitting ? "Analyzing..." : "Check this career"}
          </Button>
        </form>
        {customError && <p style={{ color: "var(--color-danger)", fontSize: 12.5, marginTop: 10 }}>{customError}</p>}
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720, marginBottom: selected.length >= 2 ? 88 : 0 }}>
        {matches.map((match, i) => {
          const isSelected = selected.includes(match.careerId);
          return (
            <Card
              key={match.careerId || match.careerName}
              style={{ border: isSelected ? "1.5px solid var(--color-primary)" : undefined }}
            >
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                <label style={{ display: "flex", alignItems: "center", paddingTop: 6, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(match.careerId)}
                    disabled={!isSelected && selected.length >= MAX_COMPARE}
                    style={{ width: 16, height: 16, accentColor: "var(--color-primary)", cursor: "pointer" }}
                  />
                </label>

                <MatchCircle percent={match.matchPercentage} size={84} />

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      #{i + 1}
                    </span>
                    <h3 style={{ fontSize: 19 }}>{match.careerName}</h3>
                  </div>

                  {match.reason?.length > 0 && (
                    <ul style={{ margin: "0 0 14px", paddingLeft: 18, fontSize: 13.5, color: "var(--color-text-muted)" }}>
                      {match.reason.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  )}

                  {match.matchingSkills?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>
                        Skills you already have
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {match.matchingSkills.map((s) => (
                          <Badge key={s} tone="success">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.missingSkills?.length > 0 ? (
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>
                        Skills to improve
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {match.missingSkills.map((s) => (
                          <Badge key={s} tone="warning">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 14 }}>
                      <Badge tone="success">You're fully qualified for this role 🎉</Badge>
                    </div>
                  )}

                  {isFullyQualified(match) ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        window.open(buildJobSearchUrl(match.careerName), "_blank", "noopener,noreferrer")
                      }
                    >
                      Apply on {getJobPortalName()} →
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        navigate(`/careers/${match.careerId}`, { state: { match } })
                      }
                    >
                      View details &amp; courses
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selected.length >= 2 && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "calc(var(--sidebar-width) + 40px)",
            right: 40,
            maxWidth: 680,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-raised)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {selected.length} career{selected.length > 1 ? "s" : ""} selected
          </span>
          <Button size="sm" onClick={handleCompare}>
            Compare Selected
          </Button>
        </div>
      )}
    </AppLayout>
  );
};

export default CareerResultsPage;
