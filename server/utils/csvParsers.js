// Small, focused parsers for the messy raw strings in the Coursera CSV.
// Kept separate from the seed script so they're independently testable.

export const parseSkills = (skillsRaw) => {
  if (!skillsRaw) return [];
  return skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

// "20K" -> 20000, "1.2K" -> 1200, "500" -> 500, "" -> 0
export const parseReviewCount = (raw) => {
  if (!raw) return 0;
  const cleaned = String(raw).trim().toUpperCase();
  if (cleaned.endsWith("K")) {
    return Math.round(parseFloat(cleaned.replace("K", "")) * 1000);
  }
  if (cleaned.endsWith("M")) {
    return Math.round(parseFloat(cleaned.replace("M", "")) * 1000000);
  }
  const num = parseInt(cleaned.replace(/,/g, ""), 10);
  return Number.isNaN(num) ? 0 : num;
};

// "700,909" -> 700909
export const parseStudentsEnrolled = (raw) => {
  if (!raw) return 0;
  const num = parseInt(String(raw).replace(/,/g, ""), 10);
  return Number.isNaN(num) ? 0 : num;
};

export const parseRating = (raw) => {
  const num = parseFloat(raw);
  return Number.isNaN(num) ? null : num;
};

const VALID_DIFFICULTY = ["Beginner", "Intermediate", "Advanced", "Mixed"];
export const parseDifficulty = (raw) => {
  const trimmed = (raw || "").trim();
  return VALID_DIFFICULTY.includes(trimmed) ? trimmed : "Mixed";
};

const VALID_TYPE = ["Course", "Specialization", "Professional Certificate", "Guided Project", "Project"];
export const parseType = (raw) => {
  const trimmed = (raw || "").trim();
  return VALID_TYPE.includes(trimmed) ? trimmed : "Course";
};
