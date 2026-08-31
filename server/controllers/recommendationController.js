import Career from "../models/Career.js";
import Course from "../models/Course.js";
import { rankCareerMatches } from "../services/careerMatchingService.js";
import { findCoursesBySkills } from "../services/courseService.js";

// POST /api/recommendations
// Body: student profile fields, optionally { careerId } to target a specific
// career instead of using the top overall match.
// Convenience endpoint combining career matching + course search in one
// round trip — everything it returns comes from the same retrieval
// functions used by /api/career/analyze and /api/courses/search, so results
// are always consistent with those endpoints.
export const getRecommendations = async (req, res, next) => {
  try {
    const { careerId, ...profileFields } = req.body;
    const careers = await Career.find({});

    if (careers.length === 0) {
      return res.status(503).json({
        success: false,
        message: "Career knowledge base is empty. Run 'npm run seed' first.",
      });
    }

    const scope = careerId ? careers.filter((c) => c._id.toString() === careerId) : careers;
    if (careerId && scope.length === 0) {
      return res.status(404).json({ success: false, message: "Career not found." });
    }

    const matches = rankCareerMatches(profileFields, scope, careerId ? 1 : 1);
    const topMatch = matches[0];

    const recommendedCourses = topMatch?.missingSkills?.length
      ? await findCoursesBySkills(Course, topMatch.missingSkills, { limit: 10 })
      : [];

    res.json({
      success: true,
      data: {
        careerMatch: topMatch || null,
        recommendedCourses,
      },
    });
  } catch (err) {
    next(err);
  }
};
