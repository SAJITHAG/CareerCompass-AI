// Retrieval-only course matching — this is the ONLY place course results
// come from. The AI service (Step 8) will only ever rank/explain courses
// that this function already found in MongoDB; it never invents them.

import { estimateCourseHours, READINESS_REFERENCE_PACE_HOURS_PER_WEEK } from "../utils/durationParser.js";

const normalize = (s) => (s || "").toString().trim().toLowerCase();

// Cached in-memory so repeated "type any career" requests (see
// careerController.js) don't re-run a distinct() query every time — the
// dataset's skill vocabulary only changes when someone re-seeds the DB, and
// a process restart naturally clears this.
let vocabularyCache = null;

/**
 * The real, authoritative skill vocabulary — every distinct skill name that
 * actually appears in the Course collection (i.e. was pulled straight from
 * the Coursera dataset's Skills column). This is the single source of truth
 * used to (a) constrain what Gemini is allowed to pick from when generating
 * a custom, non-curated career, and (b) validate its output afterward — see
 * aiService.js's generateCustomCareerSkills. Pulling live from the DB
 * (rather than a separate hardcoded list) means it can never drift out of
 * sync with whatever dataset is actually seeded.
 *
 * @param {import('mongoose').Model} Course
 */
export const getSkillVocabulary = async (Course) => {
  if (vocabularyCache) return vocabularyCache;

  const skills = await Course.distinct("skills");
  vocabularyCache = skills.filter(Boolean).sort();
  return vocabularyCache;
};

/**
 * Build a MongoDB query + in-memory relevance ranking for courses matching
 * a list of target skills (e.g. a student's missing skills for a career).
 *
 * Uses exact (case-insensitive) matching first, then falls back to
 * substring matching for skills that don't appear verbatim in the dataset's
 * skill vocabulary (e.g. career skill "Node.js" vs a course tag containing
 * "Back-End Web Development" — different wording, related meaning).
 *
 * @param {import('mongoose').Model} Course
 * @param {string[]} skills - skills to search for (case-insensitive)
 * @param {object} filters - { difficulty, minRating, type, limit }
 */
export const findCoursesBySkills = async (Course, skills = [], filters = {}) => {
  const { difficulty, minRating, type, limit = 20 } = filters;

  const targetSkills = skills.map(normalize).filter(Boolean);
  if (targetSkills.length === 0) {
    return [];
  }

  const baseFilter = {};
  if (difficulty) baseFilter.difficulty = difficulty;
  if (type) baseFilter.type = type;
  if (minRating) baseFilter.rating = { $gte: Number(minRating) };

  // Candidate pool: exact skillsLower match OR (as a safety net) any course,
  // since a fully separate dataset vocabulary means exact matches can be
  // sparse or empty for some skill names.
  const candidates = await Course.find(baseFilter).limit(700).lean();

  const scoreCourse = (course) => {
    const courseSkillSet = new Set(course.skillsLower || []);
    let exactOverlap = 0;
    let fuzzyOverlap = 0;

    targetSkills.forEach((target) => {
      if (courseSkillSet.has(target)) {
        exactOverlap += 1;
        return;
      }
      // Fuzzy: does any course skill contain the target as a substring,
      // or vice versa (handles "React" vs "React (web framework)",
      // "Node.js" vs no direct match at all -> falls through to 0).
      const fuzzyHit = (course.skillsLower || []).some(
        (courseSkill) => courseSkill.includes(target) || target.includes(courseSkill)
      );
      if (fuzzyHit) fuzzyOverlap += 1;
    });

    return { exactOverlap, fuzzyOverlap, total: exactOverlap + fuzzyOverlap };
  };

  const ranked = candidates
    .map((course) => ({ course, ...scoreCourse(course) }))
    .filter((c) => c.total > 0)
    .sort((a, b) => {
      // Exact matches rank above fuzzy, then by total coverage, then rating
      if (b.exactOverlap !== a.exactOverlap) return b.exactOverlap - a.exactOverlap;
      if (b.total !== a.total) return b.total - a.total;
      return (b.course.rating || 0) - (a.course.rating || 0);
    })
    .slice(0, limit)
    .map(({ course, exactOverlap, fuzzyOverlap, total }) => ({
      ...course,
      matchedSkillCount: total,
      exactSkillMatches: exactOverlap,
      relevanceScore: Math.round((total / targetSkills.length) * 100) / 100,
    }));

  return ranked;
};

/**
 * General free-text course search (title/description/organization) using
 * the Mongo text index — used for the "Recommend courses for learning React"
 * style chat queries where the user names a topic rather than a skill list.
 */
export const searchCoursesByText = async (Course, queryText, filters = {}) => {
  const { difficulty, minRating, type, limit = 20 } = filters;

  const query = { $text: { $search: queryText } };
  if (difficulty) query.difficulty = difficulty;
  if (type) query.type = type;
  if (minRating) query.rating = { $gte: Number(minRating) };

  const results = await Course.find(query, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();

  return results;
};

/**
 * Time-to-readiness estimator.
 *
 * For each missing skill, picks the single best-matching course (by the
 * same exact/fuzzy + rating ranking findCoursesBySkills already uses),
 * estimates that course's total hours from its free-text Duration field
 * (previously unused — see durationParser.js), sums across all missing
 * skills, then divides by the student's stated hours/week to produce a
 * personalized weeks-to-ready figure. One course per skill (not every
 * matching course) so the total doesn't balloon into "read the whole
 * catalog" territory.
 *
 * @param {import('mongoose').Model} Course
 * @param {string[]} missingSkills
 * @param {number} hoursPerWeek - student-stated availability, must be > 0
 */
export const estimateReadiness = async (Course, missingSkills = [], hoursPerWeek) => {
  const skills = (missingSkills || []).map((s) => s.trim()).filter(Boolean);

  if (skills.length === 0) {
    return { totalHours: 0, weeks: 0, hoursPerWeek, skillPlan: [], unmatchedSkills: [] };
  }

  const skillPlan = [];
  const unmatchedSkills = [];

  for (const skill of skills) {
    // Reuse the shared ranking logic, scoped to just this one skill, so the
    // "best course for this gap" choice is consistent with what the rest
    // of the app (course search, recommendations) would surface.
    const [bestCourse] = await findCoursesBySkills(Course, [skill], { limit: 1 });

    if (!bestCourse) {
      unmatchedSkills.push(skill);
      continue;
    }

    const { totalHours, midpointWeeksAtReferencePace } = estimateCourseHours(bestCourse.duration);

    skillPlan.push({
      skill,
      courseId: bestCourse._id,
      courseTitle: bestCourse.title,
      organization: bestCourse.organization,
      duration: bestCourse.duration,
      estimatedHours: totalHours,
      referencePaceWeeks: midpointWeeksAtReferencePace,
    });
  }

  const totalHours = Math.round(skillPlan.reduce((sum, s) => sum + s.estimatedHours, 0) * 10) / 10;
  const weeks = hoursPerWeek > 0 ? Math.max(1, Math.ceil(totalHours / hoursPerWeek)) : null;

  return {
    totalHours,
    weeks,
    hoursPerWeek,
    referencePaceHoursPerWeek: READINESS_REFERENCE_PACE_HOURS_PER_WEEK,
    skillPlan,
    unmatchedSkills,
  };
};
