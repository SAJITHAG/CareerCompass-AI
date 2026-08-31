import Career from "../models/Career.js";
import Course from "../models/Course.js";
import { rankCareerMatches, scoreCareerMatch } from "../services/careerMatchingService.js";
import { getSkillVocabulary } from "../services/courseService.js";
import { generateCustomCareerSkills } from "../services/aiService.js";

const normalizeName = (s) => (s || "").toString().trim().toLowerCase();

// POST /api/career/analyze
// Body: student profile fields (technicalSkills, softSkills, interests,
// favoriteSubjects, careerGoal, experienceLevel, education)
// Returns top 3-5 careers with transparent match scores.
export const analyzeCareer = async (req, res, next) => {
  try {
    const {
      technicalSkills = [],
      softSkills = [],
      interests = [],
      favoriteSubjects = [],
      careerGoal = "",
      experienceLevel = "Student",
      education = "",
    } = req.body;

    if (
      (!technicalSkills || technicalSkills.length === 0) &&
      (!softSkills || softSkills.length === 0) &&
      (!interests || interests.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least some skills or interests to analyze.",
      });
    }

    const careers = await Career.find({});
    if (careers.length === 0) {
      return res.status(503).json({
        success: false,
        message: "Career knowledge base is empty. Run 'npm run seed' first.",
      });
    }

    const studentProfile = {
      technicalSkills,
      softSkills,
      interests,
      favoriteSubjects,
      careerGoal,
      experienceLevel,
      education,
    };

    const topMatches = rankCareerMatches(studentProfile, careers, 5);

    res.json({
      success: true,
      data: {
        matches: topMatches,
        analyzedAt: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/career/custom
// "Type any career" mode. Body: { careerName, ...same student profile
// fields as /career/analyze }.
// If careerName matches a curated career we already have, scores against
// that real curated data (no AI call needed). Otherwise asks Gemini to pick
// this career's required/optional skills, constrained to the dataset's own
// real skill vocabulary, then runs the result through the exact same
// deterministic scoreCareerMatch() engine as every curated career — so the
// match percentage is never AI-generated, only the skill list is.
export const analyzeCustomCareer = async (req, res, next) => {
  try {
    const {
      careerName = "",
      technicalSkills = [],
      softSkills = [],
      interests = [],
      favoriteSubjects = [],
      careerGoal = "",
      experienceLevel = "Student",
      education = "",
    } = req.body;

    const trimmedName = careerName.trim();
    if (!trimmedName) {
      return res.status(400).json({ success: false, message: "Please enter a career name." });
    }

    const studentProfile = {
      technicalSkills,
      softSkills,
      interests,
      favoriteSubjects,
      careerGoal,
      experienceLevel,
      education,
    };

    // Already have this one curated? Use the real data — same reasoning
    // quality, none of the hallucination risk, no wasted AI call.
    const existingCareers = await Career.find({});
    const existing = existingCareers.find((c) => normalizeName(c.name) === normalizeName(trimmedName));
    if (existing) {
      const matchResult = scoreCareerMatch(studentProfile, existing);
      return res.json({ success: true, data: { match: matchResult, career: existing, source: "curated" } });
    }

    const vocabulary = await getSkillVocabulary(Course);
    if (vocabulary.length === 0) {
      return res.status(503).json({
        success: false,
        message: "Course dataset is empty. Run 'npm run seed' first.",
      });
    }

    const generated = await generateCustomCareerSkills(trimmedName, vocabulary);

    const customCareer = {
      name: trimmedName,
      description: generated.description,
      requiredSkills: generated.requiredSkills,
      optionalSkills: generated.optionalSkills,
      relatedInterests: generated.relatedInterests,
      difficultyLevel: generated.difficultyLevel,
      recommendedLearningSequence: [...generated.requiredSkills, ...generated.optionalSkills],
    };

    const matchResult = scoreCareerMatch(studentProfile, customCareer);

    res.json({
      success: true,
      data: { match: matchResult, career: customCareer, source: "ai-generated" },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/careers
export const getAllCareers = async (req, res, next) => {
  try {
    const careers = await Career.find({}).select("name description difficultyLevel");
    res.json({ success: true, data: careers });
  } catch (err) {
    next(err);
  }
};

// GET /api/careers/:id
export const getCareerById = async (req, res, next) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      return res.status(404).json({ success: false, message: "Career not found" });
    }
    res.json({ success: true, data: career });
  } catch (err) {
    next(err);
  }
};
