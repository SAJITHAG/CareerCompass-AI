import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getDashboard, getCareerById, toggleSkillCompletion } from "../services/careerService";
import { getCurrentUser } from "../services/authService";

// A completed skill older than this is nudged for a revisit — skills fade
// from memory, so "done" on the roadmap shouldn't mean "forget it forever."
const STALE_THRESHOLD_DAYS = 180;

// Mirrors server/utils/skillMapKey.js's decodeSkillKey — the server encodes
// "." as "%2E" (and a leading "$" as "%24") before using a skill name as a
// Mongoose Map key, since MongoDB field names can't contain either. This
// reverses that so the UI always shows the real skill name (e.g. "React.js").
const decodeSkillKey = (key) => key.replace(/%2E/g, ".").replace(/^%24/, "$");

const formatRelativeTime = (date) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

// Turns a profile's technicalSkills + softSkills into the two pieces of
// state this page actually needs: a lowercased lookup set (for "is this
// phase complete") and a lowercased timestamp map (for "learned X ago").
const deriveSkillState = (profile) => {
  const skills = new Set(
    [...(profile?.technicalSkills || []), ...(profile?.softSkills || [])].map((s) => s.toLowerCase())
  );
  const rawTimestamps = profile?.skillTimestamps || {};
  const timestamps = {};
  Object.entries(rawTimestamps).forEach(([key, date]) => {
    timestamps[decodeSkillKey(key).toLowerCase()] = date;
  });
  return { skills, timestamps };
};

const RoadmapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [career, setCareer] = useState(location.state?.career || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  // The single source of truth for "has this student learned this skill":
  // their actual saved technicalSkills/softSkills, fetched fresh on every
  // mount of this page. Previously this was derived from a mix of the
  // career-match's matchingSkills (a filtered, career-scoped subset — it
  // only contains skills that happen to be in *this* career's required/
  // optional list, so a foundational roadmap skill like "HTML and CSS"
  // that isn't itself one of the four "required" tags never appeared
  // there) merged with skillTimestamps via separate effects. Those two
  // effects could fire in either order depending on which network request
  // finished first, and the matchingSkills effect did a hard overwrite —
  // so a toggle could get silently wiped out on remount. Using the
  // student's real skill list directly removes that whole race condition,
  // and matches exactly what the Dashboard's roadmap-percentage already
  // uses server-side, so the two numbers agree.
  const [knownSkills, setKnownSkills] = useState(new Set());
  const [skillTimestamps, setSkillTimestamps] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [togglingSkill, setTogglingSkill] = useState(null);
  const [toggleError, setToggleError] = useState("");

  // If we didn't arrive with route state (e.g. clicked "Roadmap" in the
  // sidebar directly), fall back to the student's top dashboard match.
  useEffect(() => {
    if (location.state) return;

    getDashboard()
      .then(async (dash) => {
        const top = dash.topMatches?.[0];
        if (!top) {
          setLoading(false);
          return;
        }
        const fullCareer = await getCareerById(top.careerId);
        setCareer(fullCareer);
        setLoading(false);
      })
      .catch(() => {
        setError("Couldn't load your roadmap. Try running the assessment first.");
        setLoading(false);
      });
  }, [location.state]);

  // Load the student's real, current skill list + timestamps every time
  // this page mounts — this is what makes "Mark complete" survive
  // navigating away and back: it's read fresh from the server, not
  // reconstructed from whatever data happened to be passed in via route
  // state or a career-specific match object.
  useEffect(() => {
    getCurrentUser()
      .then((u) => {
        const { skills, timestamps } = deriveSkillState(u.profile);
        setKnownSkills(skills);
        setSkillTimestamps(timestamps);
      })
      .catch(() => {
        // Falls back to an empty set — phases just show as incomplete
        // rather than the page breaking.
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const handleToggle = async (skill, wasCompleted) => {
    const skillLower = skill.toLowerCase();
    const nextCompleted = !wasCompleted;

    setToggleError("");
    setTogglingSkill(skillLower);

    // Optimistic update — the roadmap feels instant, then we reconcile
    // with whatever the server actually persisted.
    setKnownSkills((prev) => {
      const next = new Set(prev);
      if (nextCompleted) next.add(skillLower);
      else next.delete(skillLower);
      return next;
    });

    try {
      const updatedProfile = await toggleSkillCompletion(skill, nextCompleted);
      // Reconcile from the server's authoritative profile in one shot —
      // both knownSkills and skillTimestamps come from the same response,
      // so they can never drift apart from each other.
      const { skills, timestamps } = deriveSkillState(updatedProfile);
      setKnownSkills(skills);
      setSkillTimestamps(timestamps);
    } catch (err) {
      // Revert the optimistic change on failure.
      setKnownSkills((prev) => {
        const next = new Set(prev);
        if (nextCompleted) next.delete(skillLower);
        else next.add(skillLower);
        return next;
      });
      setToggleError(err.response?.data?.message || "Couldn't save that — please try again.");
    } finally {
      setTogglingSkill(null);
    }
  };

  if (loading || profileLoading) {
    return (
      <AppLayout>
        <p style={{ color: "var(--color-text-muted)" }}>Loading your roadmap...</p>
      </AppLayout>
    );
  }

  if (error || !career) {
    return (
      <AppLayout>
        <Card style={{ maxWidth: 480 }}>
          <p style={{ marginBottom: 16 }}>
            {error || "No roadmap yet — complete the career assessment to generate one."}
          </p>
          <Button onClick={() => navigate("/assessment")}>Go to Assessment</Button>
        </Card>
      </AppLayout>
    );
  }

  const sequence = career.recommendedLearningSequence || [];

  const phases = sequence.map((skill, i) => ({
    phase: i + 1,
    skill,
    completed: knownSkills.has(skill.toLowerCase()),
  }));

  const completedCount = phases.filter((p) => p.completed).length;
  const percentComplete = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;

  return (
    <AppLayout>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>{career.name} Roadmap</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 8 }}>
        A suggested learning sequence to build toward this career — check off a phase once you've learned it.
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)", marginBottom: 12 }}>
        {percentComplete}% complete ({completedCount} of {phases.length} phases)
      </p>
      {toggleError && <p style={{ fontSize: 12.5, color: "var(--color-danger)", marginBottom: 12 }}>{toggleError}</p>}

      <div style={{ maxWidth: 620, position: "relative" }}>
        {phases.map((p, i) => {
          const skillLower = p.skill.toLowerCase();
          const timestamp = skillTimestamps[skillLower];
          const isStale =
            p.completed && timestamp && (Date.now() - new Date(timestamp).getTime()) / 86400000 > STALE_THRESHOLD_DAYS;
          const isToggling = togglingSkill === skillLower;

          return (
            <div key={p.phase} style={{ display: "flex", gap: 20 }}>
              {/* Timeline rail — now clickable to mark the phase complete/incomplete */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => handleToggle(p.skill, p.completed)}
                  disabled={isToggling}
                  aria-pressed={p.completed}
                  aria-label={p.completed ? `Mark ${p.skill} as not learned` : `Mark ${p.skill} as learned`}
                  title={p.completed ? "Mark as not learned yet" : "Mark as learned"}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    padding: 0,
                    cursor: isToggling ? "wait" : "pointer",
                    color: p.completed ? "#fff" : "var(--color-primary)",
                    background: p.completed ? "var(--color-success)" : "rgba(79, 70, 229, 0.1)",
                    border: p.completed ? "none" : "2px solid var(--color-primary)",
                    opacity: isToggling ? 0.6 : 1,
                    transition: "background 0.15s ease, opacity 0.15s ease",
                  }}
                >
                  {p.completed ? "✓" : p.phase}
                </button>
                {i < phases.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 40, background: "var(--color-border)" }} />
                )}
              </div>

              <div style={{ paddingBottom: 32, flex: 1 }}>
                <Card style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>
                        Phase {p.phase}
                      </p>
                      <h3 style={{ fontSize: 16 }}>{p.skill}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(p.skill, p.completed)}
                      disabled={isToggling}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: 999,
                        whiteSpace: "nowrap",
                        cursor: isToggling ? "wait" : "pointer",
                        border: p.completed ? "1px solid var(--color-border)" : "1px solid var(--color-primary)",
                        background: p.completed ? "var(--color-surface)" : "rgba(79, 70, 229, 0.08)",
                        color: p.completed ? "var(--color-text-muted)" : "var(--color-primary)",
                      }}
                    >
                      {p.completed ? "Mark incomplete" : "Mark complete"}
                    </button>
                  </div>

                  {p.completed && !isStale && (
                    <p style={{ fontSize: 12.5, color: "var(--color-success)", marginTop: 8, fontWeight: 600 }}>
                      {timestamp ? `Learned ${formatRelativeTime(timestamp)}` : "Already covered by your skills"}
                    </p>
                  )}

                  {isStale && (
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "var(--color-warning)",
                        marginTop: 8,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      🔄 Learned {formatRelativeTime(timestamp)} — worth a quick revisit
                    </p>
                  )}
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default RoadmapPage;
