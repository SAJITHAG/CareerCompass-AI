import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TagInput from "../components/ui/TagInput";
import { analyzeCareer, updateProfile, parseResumeFile } from "../services/careerService";

const SUGGESTED_TECH_SKILLS = ["Python", "JavaScript", "React", "SQL", "MongoDB", "HTML and CSS", "Java"];
const SUGGESTED_SOFT_SKILLS = ["Communication", "Problem Solving", "Leadership and Management", "Collaboration"];
const SUGGESTED_INTERESTS = ["Web Design", "Machine Learning", "Data Analysis", "Cloud Infrastructure"];

const EXPERIENCE_LEVELS = ["Student", "Fresher", "0-1 years", "1-3 years", "3+ years"];
const WORK_TYPES = ["Remote", "Hybrid", "On-site", "No preference"];

const labelStyle = { fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 };
const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "var(--radius-sm)",
  border: "1.5px solid var(--color-border)",
  fontSize: 14,
};
const fieldWrap = { marginBottom: 22 };

const EMPTY_FORM = {
  education: "",
  experienceLevel: "Student",
  technicalSkills: [],
  softSkills: [],
  interests: [],
  favoriteSubjects: [],
  preferredWorkType: "No preference",
  careerGoal: "",
};

const AssessmentPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [parsingResume, setParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [prefilledFromResume, setPrefilledFromResume] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeError("");
    setParsingResume(true);
    setResumeFileName(file.name);

    try {
      // Same studentProfile shape the form already produces — the resume
      // is just a second way to fill it in, not a separate code path.
      const extracted = await parseResumeFile(file);
      setForm((f) => ({ ...EMPTY_FORM, ...extracted, preferredWorkType: f.preferredWorkType }));
      setPrefilledFromResume(true);
    } catch (err) {
      setResumeError(err.response?.data?.message || "Couldn't read that resume. Please try another file or fill in the form manually.");
    } finally {
      setParsingResume(false);
      // Reset whichever input actually fired this handler (file or photo)
      // so selecting the same file again re-triggers onChange.
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.technicalSkills.length === 0 && form.softSkills.length === 0 && form.interests.length === 0) {
      setError("Add at least a few skills or interests so we have something to match against.");
      return;
    }

    setSubmitting(true);
    try {
      // Save the profile to the account, then run the analysis — both use
      // the same real data, no duplication of what the student typed.
      await updateProfile(form);
      const result = await analyzeCareer(form);
      navigate("/results", { state: { matches: result.matches, studentProfile: form } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong analyzing your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Career Assessment</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
        Tell us about your skills, interests, and goals — this powers your career match.
      </p>

      <Card style={{ maxWidth: 640, marginBottom: 20, background: "rgba(79, 70, 229, 0.03)" }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Have a resume? Skip the typing.</p>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 14 }}>
          Upload a file, or snap a photo of a printed resume — either way we'll pre-fill the form below for you to
          review before submitting.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={parsingResume}
            onClick={() => fileInputRef.current?.click()}
          >
            {parsingResume ? "Reading resume..." : "Upload file (PDF/DOCX)"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleResumeUpload}
            style={{ display: "none" }}
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={parsingResume}
            onClick={() => photoInputRef.current?.click()}
          >
            {parsingResume ? "Reading resume..." : "Take/upload a photo"}
          </Button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleResumeUpload}
            style={{ display: "none" }}
          />

          {resumeFileName && !parsingResume && !resumeError && (
            <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{resumeFileName}</span>
          )}
        </div>
        {resumeError && <p style={{ color: "var(--color-danger)", fontSize: 12.5, marginTop: 10 }}>{resumeError}</p>}
        {prefilledFromResume && !resumeError && (
          <p style={{ color: "var(--color-success)", fontSize: 12.5, marginTop: 10 }}>
            Form pre-filled from your resume — check it over below before submitting.
          </p>
        )}
      </Card>

      <Card style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Education</label>
            <input
              style={inputStyle}
              value={form.education}
              onChange={(e) => set("education")(e.target.value)}
              placeholder="e.g. B.Tech Computer Science, 2026"
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Current experience level</label>
            <select
              style={inputStyle}
              value={form.experienceLevel}
              onChange={(e) => set("experienceLevel")(e.target.value)}
            >
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Technical skills</label>
            <TagInput
              value={form.technicalSkills}
              onChange={set("technicalSkills")}
              placeholder="Type a skill and press Enter"
              suggestions={SUGGESTED_TECH_SKILLS}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Soft skills</label>
            <TagInput
              value={form.softSkills}
              onChange={set("softSkills")}
              placeholder="e.g. Communication, Problem Solving"
              suggestions={SUGGESTED_SOFT_SKILLS}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Interests</label>
            <TagInput
              value={form.interests}
              onChange={set("interests")}
              placeholder="What topics excite you?"
              suggestions={SUGGESTED_INTERESTS}
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Favorite subjects</label>
            <TagInput
              value={form.favoriteSubjects}
              onChange={set("favoriteSubjects")}
              placeholder="e.g. Mathematics, Design"
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Preferred work type</label>
            <select
              style={inputStyle}
              value={form.preferredWorkType}
              onChange={(e) => set("preferredWorkType")(e.target.value)}
            >
              {WORK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Career goal</label>
            <input
              style={inputStyle}
              value={form.careerGoal}
              onChange={(e) => set("careerGoal")(e.target.value)}
              placeholder="e.g. I want to become a Full Stack Developer"
            />
          </div>

          {error && <p style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 16 }}>{error}</p>}

          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? "Analyzing..." : "Get My Career Matches"}
          </Button>
        </form>
      </Card>
    </AppLayout>
  );
};

export default AssessmentPage;
