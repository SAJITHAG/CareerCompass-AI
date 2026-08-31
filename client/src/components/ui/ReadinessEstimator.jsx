import { useState } from "react";
import Card from "./Card";
import Button from "./Button";
import { estimateReadiness } from "../../services/courseService";

// Turns the student's missing-skills list into an actual personalized
// timeline instead of a static roadmap with no sense of time. Uses each
// recommended course's (previously unused) Duration field under the hood —
// see server/utils/durationParser.js for how that gets converted to hours.
const ReadinessEstimator = ({ careerName, missingSkills = [] }) => {
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  if (!missingSkills || missingSkills.length === 0) {
    return null;
  }

  const handleCalculate = async () => {
    const hours = Number(hoursPerWeek);
    if (!Number.isFinite(hours) || hours <= 0) {
      setError("Enter how many hours a week you can realistically study.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await estimateReadiness({ missingSkills, hoursPerWeek: hours });
      setResult(data);
    } catch {
      setError("Couldn't calculate a timeline right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 720, marginBottom: 32, border: "1px solid rgba(124, 58, 237, 0.16)" }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", marginBottom: 4, letterSpacing: "0.03em" }}>
        ⏱ TIME-TO-READINESS ESTIMATOR
      </p>
      <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginBottom: 16 }}>
        Turn your {missingSkills.length} missing skill{missingSkills.length > 1 ? "s" : ""} into a real timeline,
        based on actual course durations.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ fontSize: 13.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
          How many hours/week can you study?
          <input
            type="number"
            min={1}
            max={80}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            style={{
              width: 64,
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--color-border)",
              fontSize: 14,
              textAlign: "center",
            }}
          />
        </label>
        <Button size="sm" onClick={handleCalculate} disabled={loading}>
          {loading ? "Calculating..." : "Calculate my timeline"}
        </Button>
      </div>

      {error && <p style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {result && (
        <div>
          {result.weeks != null ? (
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              You could be{" "}
              <span
                style={{
                  background: "var(--color-gradient-vivid)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {careerName}-ready
              </span>{" "}
              in ~{result.weeks} week{result.weeks !== 1 ? "s" : ""} at {result.hoursPerWeek} hrs/week.
            </p>
          ) : (
            <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 4 }}>
              Couldn't compute a timeline for this skill set yet.
            </p>
          )}

          <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 12 }}>
            ~{result.totalHours} hours of coursework total, one recommended course per missing skill.
          </p>

          {result.unmatchedSkills?.length > 0 && (
            <p style={{ fontSize: 12.5, color: "var(--color-warning)", marginBottom: 12 }}>
              No matching course found for: {result.unmatchedSkills.join(", ")} — not included in the estimate above.
            </p>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              marginBottom: expanded ? 10 : 0,
            }}
          >
            {expanded ? "Hide breakdown ▲" : "Show breakdown by skill ▼"}
          </button>

          {expanded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.skillPlan.map((s) => (
                <div
                  key={s.skill}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-bg)",
                    fontSize: 12.5,
                  }}
                >
                  <span>
                    <strong>{s.skill}</strong> — {s.courseTitle}
                    <span style={{ color: "var(--color-text-muted)" }}> ({s.organization})</span>
                  </span>
                  <span style={{ color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>~{s.estimatedHours}h</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ReadinessEstimator;
