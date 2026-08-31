import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import MatchCircle from "../components/ui/MatchCircle";
import { searchCourses } from "../services/courseService";
import { getCareerById } from "../services/careerService";
import ReadinessEstimator from "../components/ui/ReadinessEstimator";
import { buildJobSearchUrl, getJobPortalName, isFullyQualified } from "../utils/jobPortal";

const DIFFICULTY_FILTERS = ["All", "Beginner", "Intermediate", "Advanced"];

const CareerDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [match, setMatch] = useState(location.state?.match || null);
  // AI-generated ("type any career") results pass their generated career
  // data directly via route state, since it has no real database _id to
  // look up — this pre-fills it and skips the getCareerById fetch below.
  const [careerFull, setCareerFull] = useState(location.state?.career || null);
  const [careerLoadError, setCareerLoadError] = useState("");
  const isCustomCareer = Boolean(location.state?.isCustom);

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // If the page was opened directly (e.g. a refresh, or a shared link)
  // rather than via navigation from the results page, we won't have the
  // computed match in route state — fall back to fetching the career's
  // static info by id so the page still renders something useful.
  useEffect(() => {
    if (match || !id) return;
    getCareerById(id)
      .then((career) => {
        setCareerFull(career);
        setMatch({
          careerId: career._id,
          careerName: career.name,
          matchPercentage: null,
          matchingSkills: [],
          missingSkills: career.requiredSkills || [],
        });
      })
      .catch(() => setCareerLoadError("Couldn't load this career. Try again from your results page."));
  }, [id, match]);

  // Fetch the full career document (has recommendedLearningSequence, used
  // by the roadmap page) once we know which career this is — regardless of
  // whether match came from route state or the fallback above.
  useEffect(() => {
    if (careerFull || !match?.careerId) return;
    getCareerById(match.careerId).then(setCareerFull).catch(() => {});
  }, [match, careerFull]);

  useEffect(() => {
    if (!match?.missingSkills?.length) return;
    setLoadingCourses(true);
    setCourseError("");
    searchCourses({
      skills: match.missingSkills,
      difficulty: difficultyFilter === "All" ? undefined : difficultyFilter,
      limit: 12,
    })
      .then(setCourses)
      .catch(() => setCourseError("Couldn't load course recommendations right now."))
      .finally(() => setLoadingCourses(false));
  }, [match, difficultyFilter]);

  if (!match) {
    return (
      <AppLayout>
        <Card style={{ maxWidth: 480 }}>
          <p style={{ marginBottom: 12 }}>
            {careerLoadError || (
              <>
                Loading career details… if this doesn't finish, open it from your{" "}
                <Link to="/results" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  results page
                </Link>{" "}
                instead.
              </>
            )}
          </p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
        <MatchCircle percent={match.matchPercentage ?? 0} size={100} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 28 }}>{match.careerName}</h1>
            {isCustomCareer && <Badge tone="warning">AI-suggested</Badge>}
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginTop: 4 }}>
            {match.matchPercentage != null
              ? `${match.matchPercentage}% match based on your profile`
              : "Run the assessment to see your personal match score"}
          </p>
          {isCustomCareer && (
            <p style={{ color: "var(--color-text-muted)", fontSize: 12.5, marginTop: 4 }}>
              This career isn't in our curated list — its skills were selected by AI from real courses in our
              dataset, then scored with the same match formula as every other career.
            </p>
          )}
        </div>
        {careerFull?.recommendedLearningSequence?.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => navigate("/roadmap", { state: { career: careerFull, match } })}
          >
            View Learning Roadmap
          </Button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32, maxWidth: 720 }}>
        <Card>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Skills you already have</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {match.matchingSkills?.length > 0 ? (
              match.matchingSkills.map((s) => <Badge key={s} tone="success">{s}</Badge>)
            ) : (
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>None yet</span>
            )}
          </div>
        </Card>
        <Card>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Skills to improve</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {match.missingSkills?.length > 0 ? (
              match.missingSkills.map((s) => <Badge key={s} tone="warning">{s}</Badge>)
            ) : (
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>You're fully covered!</span>
            )}
          </div>
        </Card>
      </div>

      {isFullyQualified(match) && (
        <Card style={{ maxWidth: 720, marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>You're ready to apply</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              No skill gaps left for {match.careerName} — go find an opening.
            </p>
          </div>
          <Button
            onClick={() =>
              window.open(buildJobSearchUrl(match.careerName), "_blank", "noopener,noreferrer")
            }
          >
            Apply on {getJobPortalName()} →
          </Button>
        </Card>
      )}

      {match.missingSkills?.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Recommended Courses</h2>

          <ReadinessEstimator careerName={match.careerName} missingSkills={match.missingSkills} />

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {DIFFICULTY_FILTERS.map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: d === difficultyFilter ? "1.5px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                  background: d === difficultyFilter ? "rgba(79, 70, 229, 0.08)" : "transparent",
                  color: d === difficultyFilter ? "var(--color-primary)" : "var(--color-text-muted)",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {loadingCourses && <p style={{ color: "var(--color-text-muted)" }}>Loading courses...</p>}
          {courseError && <p style={{ color: "var(--color-danger)" }}>{courseError}</p>}
          {!loadingCourses && !courseError && courses.length === 0 && (
            <p style={{ color: "var(--color-text-muted)" }}>No matching courses found for this filter.</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18, maxWidth: 960 }}>
            {courses.map((course) => (
              <Card key={course._id}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-primary)", marginBottom: 6 }}>
                  {course.organization}
                </p>
                <h3 style={{ fontSize: 15.5, marginBottom: 8, lineHeight: 1.3 }}>{course.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 12.5, color: "var(--color-text-muted)" }}>
                  {course.rating != null && <span>★ {course.rating}</span>}
                  <span>{course.difficulty}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {(course.skills || []).slice(0, 3).map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
                {course.courseUrl && (
                  <a
                    href={course.courseUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}
                  >
                    View course →
                  </a>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default CareerDetailsPage;
