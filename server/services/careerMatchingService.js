import { SKILL_ALIASES, COMPOSITE_SKILL_RULES } from "../data/skillAliases.js";

// Transparent, deterministic career-matching scorer.
// No randomness, no LLM involved here — this is pure rule-based scoring so
// the percentage is always explainable and reproducible from the inputs.
//
// Score breakdown (must sum to 100):
//   Skills match:               50%
//   Interest match:              25%
//   Career goal match:           15%
//   Experience/education match:  10%

const normalize = (str) => (str || "").toString().trim().toLowerCase();

const normalizeList = (list = []) => list.map(normalize).filter(Boolean);

// Bridges the gap between what students actually type (specific tech:
// "React.js", "Node.js", "MongoDB") and the Coursera-vocabulary category
// names careers.js requires ("Front-End Web Development", "Databases", ...).
// Without this, a genuinely full-stack student's skills never satisfy
// "Full-Stack Web Development" as a literal string, so it always reads as
// missing regardless of what they actually know. See server/data/skillAliases.js.
const expandSkillsWithAliases = (normalizedSkills) => {
  const set = new Set(normalizedSkills);

  normalizedSkills.forEach((skill) => {
    const implied = SKILL_ALIASES[skill];
    if (implied) implied.forEach((category) => set.add(normalize(category)));
  });

  // Composite rules run after individual aliases so e.g. "knows both
  // frontend and backend tech" can be detected from what aliasing just added.
  COMPOSITE_SKILL_RULES.forEach((rule) => {
    const hasAll = rule.all.every((category) => set.has(normalize(category)));
    if (hasAll) rule.implies.forEach((category) => set.add(normalize(category)));
  });

  return set;
};

// Overlap ratio: how much of the career's required (or optional) skill set
// the student already covers, with partial credit for optional skills.
// Matching is done case-insensitively, but returned skill names keep their
// original display casing from the career record (not the lowercased form).
const scoreSkills = (studentSkills, career) => {
  const studentSet = expandSkillsWithAliases(normalizeList(studentSkills));
  const requiredOriginal = career.requiredSkills || [];
  const optionalOriginal = career.optionalSkills || [];

  if (requiredOriginal.length === 0 && optionalOriginal.length === 0) {
    return { score: 0, matchingSkills: [], missingSkills: [] };
  }

  const matchingRequired = requiredOriginal.filter((s) => studentSet.has(normalize(s)));
  const matchingOptional = optionalOriginal.filter((s) => studentSet.has(normalize(s)));
  const missingSkills = requiredOriginal.filter((s) => !studentSet.has(normalize(s)));

  // Required skills carry full weight, optional skills carry half weight
  const totalWeight = requiredOriginal.length * 1 + optionalOriginal.length * 0.5;
  const earnedWeight = matchingRequired.length * 1 + matchingOptional.length * 0.5;

  const ratio = totalWeight > 0 ? earnedWeight / totalWeight : 0;

  return {
    score: ratio * 50, // out of 50
    matchingSkills: [...matchingRequired, ...matchingOptional],
    missingSkills,
  };
};

const scoreInterests = (studentInterests, studentFavoriteSubjects, career) => {
  const studentSet = new Set([
    ...normalizeList(studentInterests),
    ...normalizeList(studentFavoriteSubjects),
  ]);
  const related = normalizeList(career.relatedInterests);

  if (related.length === 0 || studentSet.size === 0) {
    return 0;
  }

  const matches = related.filter((i) => studentSet.has(i)).length;
  const ratio = matches / related.length;

  return ratio * 25; // out of 25
};

// Goal match is a lighter-touch text check: does the student's stated career
// goal reference this career's name or its core skill vocabulary.
const scoreGoal = (careerGoal, career) => {
  const goal = normalize(careerGoal);
  if (!goal) return 0;

  const careerNameNorm = normalize(career.name);
  if (goal.includes(careerNameNorm) || careerNameNorm.includes(goal)) {
    return 15; // direct statement of intent, full credit
  }

  // Partial credit if the goal text mentions any required skill
  const required = normalizeList(career.requiredSkills);
  const mentionsSkill = required.some((skill) => goal.includes(skill));
  return mentionsSkill ? 7.5 : 0;
};

const EXPERIENCE_RANK = {
  Student: 0,
  Fresher: 1,
  "0-1 years": 1,
  "1-3 years": 2,
  "3+ years": 3,
};

const scoreExperience = (experienceLevel, education, career) => {
  // Simple compatibility: beginner careers suit lower experience levels,
  // advanced careers expect more. Full credit for a reasonable fit,
  // partial credit for close-but-not-exact, none for a big mismatch.
  const studentRank = EXPERIENCE_RANK[experienceLevel] ?? 0;
  const difficultyRank = { Beginner: 0, Intermediate: 1.5, Advanced: 3 }[career.difficultyLevel] ?? 1;

  const gap = Math.abs(studentRank - difficultyRank);

  let score;
  if (gap <= 0.5) score = 10;
  else if (gap <= 1.5) score = 6;
  else if (gap <= 2.5) score = 3;
  else score = 0;

  return score; // out of 10
};

/**
 * Compute a full match result for a single career against a student profile.
 * @param {object} studentProfile - { technicalSkills, softSkills, interests, favoriteSubjects, careerGoal, experienceLevel, education }
 * @param {object} career - a Career document (or plain object with the same shape)
 */
export const scoreCareerMatch = (studentProfile, career) => {
  const allStudentSkills = [
    ...(studentProfile.technicalSkills || []),
    ...(studentProfile.softSkills || []),
  ];

  const skillsResult = scoreSkills(allStudentSkills, career);
  const interestScore = scoreInterests(studentProfile.interests, studentProfile.favoriteSubjects, career);
  const goalScore = scoreGoal(studentProfile.careerGoal, career);
  const experienceScore = scoreExperience(studentProfile.experienceLevel, studentProfile.education, career);

  const totalScore = skillsResult.score + interestScore + goalScore + experienceScore;

  return {
    careerName: career.name,
    careerId: career._id,
    matchPercentage: Math.round(totalScore),
    breakdown: {
      skillsMatch: Math.round(skillsResult.score * 10) / 10,
      interestMatch: Math.round(interestScore * 10) / 10,
      goalMatch: Math.round(goalScore * 10) / 10,
      experienceMatch: Math.round(experienceScore * 10) / 10,
    },
    matchingSkills: skillsResult.matchingSkills,
    missingSkills: skillsResult.missingSkills,
    reason: buildReason(skillsResult, interestScore, goalScore, career),
  };
};

const buildReason = (skillsResult, interestScore, goalScore, career) => {
  const reasons = [];
  if (skillsResult.matchingSkills.length > 0) {
    reasons.push(`You already know ${skillsResult.matchingSkills.slice(0, 4).join(", ")}`);
  }
  if (interestScore > 0) {
    reasons.push(`Your interests align with ${career.name}`);
  }
  if (goalScore > 0) {
    reasons.push(`This matches your stated career goal`);
  }
  if (reasons.length === 0) {
    reasons.push(`Limited overlap currently, but this career is available to grow into`);
  }
  return reasons;
};

/**
 * Score all careers and return the top N, sorted by match percentage descending.
 */
export const rankCareerMatches = (studentProfile, careers, topN = 5) => {
  const scored = careers.map((career) => scoreCareerMatch(studentProfile, career));
  scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return scored.slice(0, topN);
};
