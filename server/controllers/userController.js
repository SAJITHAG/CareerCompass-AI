import User from "../models/User.js";
import Career from "../models/Career.js";
import Course from "../models/Course.js";
import { rankCareerMatches } from "../services/careerMatchingService.js";
import { findCoursesBySkills } from "../services/courseService.js";
import { encodeSkillKey, decodeSkillKey } from "../utils/skillMapKey.js";

// POST /api/profile  (requires auth)
// Body: the Step 2 profile fields. Upserts onto the logged-in user.
export const updateProfile = async (req, res, next) => {
  try {
    const {
      education,
      experienceLevel,
      technicalSkills,
      softSkills,
      interests,
      favoriteSubjects,
      preferredWorkType,
      careerGoal,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (education !== undefined) user.profile.education = education;
    if (experienceLevel !== undefined) user.profile.experienceLevel = experienceLevel;

    // technicalSkills/softSkills feed skillTimestamps too: newly-added
    // skills get stamped "now" (for freshness nudges later), skills the
    // student removes have their timestamp cleared, and skills that were
    // already there keep their original timestamp untouched.
    if (technicalSkills !== undefined || softSkills !== undefined) {
      const previousSkills = new Set(
        [...(user.profile.technicalSkills || []), ...(user.profile.softSkills || [])]
      );
      const nextSkills = new Set([
        ...(technicalSkills !== undefined ? technicalSkills : user.profile.technicalSkills || []),
        ...(softSkills !== undefined ? softSkills : user.profile.softSkills || []),
      ]);

      for (const skill of nextSkills) {
        const key = encodeSkillKey(skill);
        if (!previousSkills.has(skill) && !user.profile.skillTimestamps.has(key)) {
          user.profile.skillTimestamps.set(key, new Date());
        }
      }
      for (const skill of previousSkills) {
        if (!nextSkills.has(skill)) {
          user.profile.skillTimestamps.delete(encodeSkillKey(skill));
        }
      }

      if (technicalSkills !== undefined) user.profile.technicalSkills = technicalSkills;
      if (softSkills !== undefined) user.profile.softSkills = softSkills;
    }

    if (interests !== undefined) user.profile.interests = interests;
    if (favoriteSubjects !== undefined) user.profile.favoriteSubjects = favoriteSubjects;
    if (preferredWorkType !== undefined) user.profile.preferredWorkType = preferredWorkType;
    if (careerGoal !== undefined) user.profile.careerGoal = careerGoal;

    await user.save();

    res.json({ success: true, data: user.profile });
  } catch (err) {
    next(err);
  }
};

// POST /api/profile/skills/toggle  (requires auth)
// Body: { skill: string, completed: boolean }
// Marks a roadmap skill as learned (adds it to technicalSkills + stamps it
// with the current time) or un-marks it (removes it + clears the stamp).
// This is what makes the roadmap dynamic — completing a phase here updates
// the same profile the career-matching engine reads, so future match scores
// and dashboard numbers reflect it immediately, not just the roadmap view.
export const toggleRoadmapSkill = async (req, res, next) => {
  try {
    const { skill, completed } = req.body;

    if (!skill || typeof skill !== "string" || !skill.trim()) {
      return res.status(400).json({ success: false, message: "A valid 'skill' is required." });
    }
    if (typeof completed !== "boolean") {
      return res.status(400).json({ success: false, message: "'completed' must be true or false." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const skillLower = skill.trim().toLowerCase();
    const alreadyHasSkill = (user.profile.technicalSkills || []).some((s) => s.toLowerCase() === skillLower);

    if (completed && !alreadyHasSkill) {
      user.profile.technicalSkills.push(skill.trim());
      user.profile.skillTimestamps.set(encodeSkillKey(skill.trim()), new Date());
    } else if (!completed && alreadyHasSkill) {
      user.profile.technicalSkills = user.profile.technicalSkills.filter((s) => s.toLowerCase() !== skillLower);
      // Clear whichever exact-cased key was stored, if any (decode before
      // comparing, since stored keys are the encoded form).
      for (const key of user.profile.skillTimestamps.keys()) {
        if (decodeSkillKey(key).toLowerCase() === skillLower) user.profile.skillTimestamps.delete(key);
      }
    }

    await user.save();

    res.json({ success: true, data: user.profile });
  } catch (err) {
    next(err);
  }
};

// GET /api/user/dashboard  (requires auth)
// Recomputes the career match fresh from the user's saved profile so the
// dashboard numbers are never stale, and records the top result for
// "latestAnalysis" display without needing a separate analyze call.
export const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const careers = await Career.find({});

    const hasProfile =
      (user.profile.technicalSkills && user.profile.technicalSkills.length > 0) ||
      (user.profile.softSkills && user.profile.softSkills.length > 0) ||
      (user.profile.interests && user.profile.interests.length > 0);

    let topMatches = [];
    if (hasProfile && careers.length > 0) {
      topMatches = rankCareerMatches(user.profile, careers, 3);

      user.latestAnalysis = {
        topCareer: topMatches[0]?.careerName || null,
        matchPercentage: topMatches[0]?.matchPercentage || null,
        analyzedAt: new Date(),
      };
      await user.save();
    }

    const topMatch = topMatches[0];
    const totalRequiredSkills = topMatch
      ? (topMatch.matchingSkills.length + topMatch.missingSkills.length)
      : 0;

    // Courses recommended: real count from MongoDB against the top career's
    // missing skills (empty array -> empty result, never fabricated).
    let recommendedCourses = [];
    if (topMatch && topMatch.missingSkills.length > 0) {
      recommendedCourses = await findCoursesBySkills(Course, topMatch.missingSkills, { limit: 6 });
    }

    // Roadmap completion: how much of the career's recommended learning
    // sequence the student's current skills already cover.
    let roadmapCompletion = null;
    if (topMatch) {
      const career = careers.find((c) => c.name === topMatch.careerName);
      const sequence = career?.recommendedLearningSequence || [];
      if (sequence.length > 0) {
        const studentSkillsLower = new Set(
          [...(user.profile.technicalSkills || []), ...(user.profile.softSkills || [])].map((s) =>
            s.toLowerCase()
          )
        );
        const completed = sequence.filter((s) => studentSkillsLower.has(s.toLowerCase())).length;
        roadmapCompletion = Math.round((completed / sequence.length) * 100);
      }
    }

    res.json({
      success: true,
      data: {
        careerGoal: user.profile.careerGoal || null,
        topMatches,
        skillsProgress: topMatch
          ? { known: topMatch.matchingSkills.length, total: totalRequiredSkills }
          : null,
        coursesRecommendedCount: recommendedCourses.length,
        roadmapCompletionPercent: roadmapCompletion,
        profileComplete: hasProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};
