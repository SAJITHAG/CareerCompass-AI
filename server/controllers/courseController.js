import Course from "../models/Course.js";
import { findCoursesBySkills, searchCoursesByText, estimateReadiness } from "../services/courseService.js";

// POST /api/courses/search
// Body: { skills: string[], difficulty?, minRating?, type?, limit? }
// OR: { query: string, difficulty?, minRating?, type?, limit? } for free-text search
export const searchCourses = async (req, res, next) => {
  try {
    const { skills, query, difficulty, minRating, type, limit } = req.body;

    const filters = { difficulty, minRating, type, limit };

    let results = [];

    if (Array.isArray(skills) && skills.length > 0) {
      results = await findCoursesBySkills(Course, skills, filters);
    } else if (query && query.trim()) {
      results = await searchCoursesByText(Course, query.trim(), filters);
    } else {
      return res.status(400).json({
        success: false,
        message: "Provide either 'skills' (array) or 'query' (text) to search courses.",
      });
    }

    if (results.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "No matching courses found. Try broadening your filters or skill list.",
      });
    }

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:id
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// POST /api/courses/readiness
// Body: { missingSkills: string[], hoursPerWeek: number }
// Turns a missing-skills list into an actual personalized timeline using
// the best-matching course's Duration field for each gap.
export const getReadinessEstimate = async (req, res, next) => {
  try {
    const { missingSkills, hoursPerWeek } = req.body;

    const hours = Number(hoursPerWeek);
    if (!Number.isFinite(hours) || hours <= 0) {
      return res.status(400).json({ success: false, message: "hoursPerWeek must be a positive number." });
    }
    if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
      return res.status(400).json({ success: false, message: "missingSkills must be a non-empty array." });
    }

    const estimate = await estimateReadiness(Course, missingSkills, hours);
    res.json({ success: true, data: estimate });
  } catch (err) {
    next(err);
  }
};
