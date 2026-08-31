import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import MatchCircle from "../components/ui/MatchCircle";
import { getCareerById } from "../services/careerService";

const BREAKDOWN_ROWS = [
  { key: "skillsMatch", label: "Skills match", max: 50 },
  { key: "interestMatch", label: "Interest match", max: 25 },
  { key: "goalMatch", label: "Goal match", max: 15 },
  { key: "experienceMatch", label: "Experience match", max: 10 },
];

const ComparisonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // location.state itself is a stable reference across re-renders (it only
  // changes on navigation), so memoizing on it — rather than falling back
  // to a fresh `[]` literal every render — avoids the effect below re-firing
  // on every state update once matches is empty/undefined.
  const matches = useMemo(() => location.state?.matches || [], [location.state]);

  const [careerDetails, setCareerDetails] = useState({}); // careerId -> full career doc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matches.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(matches.map((m) => getCareerById(m.careerId)))
      .then((results) => {
        const byId = {};
        results.forEach((c) => {
          byId[c._id] = c;
        });
        setCareerDetails(byId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [matches]);

  if (matches.length < 2) {
    return (
      <AppLayout>
        <Card style={{ maxWidth: 480 }}>
          <p style={{ marginBottom: 16 }}>
            Select at least two careers on your{" "}
            <Link to="/results" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              results page
            </Link>{" "}
            to compare them side by side.
          </p>
          <Button onClick={() => navigate("/results")}>Go to Results</Button>
        </Card>
      </AppLayout>
    );
  }

  const columnWidth = Math.max(220, Math.floor(960 / matches.length));

  return (
    <AppLayout>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Compare Careers</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 28 }}>
        {matches.map((m) => m.careerName).join(" vs. ")}
      </p>

      <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 8 }}>
        {matches.map((match) => {
          const career = careerDetails[match.careerId];
          return (
            <Card key={match.careerId} style={{ minWidth: columnWidth, flex: `0 0 ${columnWidth}px` }}>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <MatchCircle percent={match.matchPercentage} size={80} />
                <h3 style={{ fontSize: 17, marginTop: 12 }}>{match.careerName}</h3>
              </div>

              {loading ? (
                <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", textAlign: "center" }}>Loading...</p>
              ) : (
                career?.description && (
                  <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 18, lineHeight: 1.5 }}>
                    {career.description}
                  </p>
                )
              )}

              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8, letterSpacing: 0.3 }}>
                  MATCH BREAKDOWN
                </p>
                {BREAKDOWN_ROWS.map((row) => {
                  const value = match.breakdown?.[row.key] ?? 0;
                  const pct = Math.min(100, (value / row.max) * 100);
                  return (
                    <div key={row.key} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
                        <span style={{ color: "var(--color-text-muted)" }}>{row.label}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          {value}/{row.max}
                        </span>
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: "var(--color-border)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-gradient)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8, letterSpacing: 0.3 }}>
                  SKILLS YOU HAVE ({match.matchingSkills?.length || 0})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {match.matchingSkills?.length > 0 ? (
                    match.matchingSkills.map((s) => <Badge key={s} tone="success">{s}</Badge>)
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>None yet</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8, letterSpacing: 0.3 }}>
                  MISSING ({match.missingSkills?.length || 0})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {match.missingSkills?.length > 0 ? (
                    match.missingSkills.map((s) => <Badge key={s} tone="warning">{s}</Badge>)
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Fully covered!</span>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                fullWidth
                variant="secondary"
                onClick={() => navigate(`/careers/${match.careerId}`, { state: { match } })}
              >
                View full details
              </Button>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default ComparisonPage;
