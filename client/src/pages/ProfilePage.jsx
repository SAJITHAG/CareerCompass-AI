import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import TagInput from "../components/ui/TagInput";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUser } from "../services/authService";
import { updateProfile, analyzeCareer } from "../services/careerService";

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

const EMPTY_PROFILE = {
  education: "",
  experienceLevel: "Student",
  technicalSkills: [],
  softSkills: [],
  interests: [],
  favoriteSubjects: [],
  preferredWorkType: "No preference",
  careerGoal: "",
};

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    getCurrentUser()
      .then((u) => setForm({ ...EMPTY_PROFILE, ...u.profile }))
      .catch(() => setError("Couldn't load your saved profile."))
      .finally(() => setLoading(false));
  }, []);

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSavedMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile(form);
      setSavedMessage("Profile saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndRematch = async () => {
    setError("");
    setSaving(true);
    try {
      await updateProfile(form);
      const result = await analyzeCareer(form);
      navigate("/results", { state: { matches: result.matches, studentProfile: form } });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't re-run your career match. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <p style={{ color: "var(--color-text-muted)" }}>Loading your profile...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Profile</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 28 }}>
        Update your skills and interests — your career matches recalculate from this.
      </p>

      <Card style={{ maxWidth: 640, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>Account</p>
        <p style={{ fontSize: 15, fontWeight: 600 }}>{user?.name}</p>
        <p style={{ fontSize: 13.5, color: "var(--color-text-muted)" }}>{user?.email}</p>
      </Card>

      <Card style={{ maxWidth: 640 }}>
        <form onSubmit={handleSave}>
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
            <select style={inputStyle} value={form.experienceLevel} onChange={(e) => set("experienceLevel")(e.target.value)}>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Technical skills</label>
            <TagInput value={form.technicalSkills} onChange={set("technicalSkills")} placeholder="Type a skill and press Enter" />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Soft skills</label>
            <TagInput value={form.softSkills} onChange={set("softSkills")} placeholder="e.g. Communication" />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Interests</label>
            <TagInput value={form.interests} onChange={set("interests")} placeholder="What topics excite you?" />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Favorite subjects</label>
            <TagInput value={form.favoriteSubjects} onChange={set("favoriteSubjects")} placeholder="e.g. Mathematics" />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Preferred work type</label>
            <select style={inputStyle} value={form.preferredWorkType} onChange={(e) => set("preferredWorkType")(e.target.value)}>
              {WORK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
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
          {savedMessage && <p style={{ color: "var(--color-success)", fontSize: 13, marginBottom: 16 }}>{savedMessage}</p>}

          <div style={{ display: "flex", gap: 12 }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" disabled={saving} onClick={handleSaveAndRematch}>
              Save &amp; recalculate matches
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
};

export default ProfilePage;
