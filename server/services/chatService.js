import Career from "../models/Career.js";
import Course from "../models/Course.js";
import { rankCareerMatches } from "./careerMatchingService.js";
import { findCoursesBySkills, searchCoursesByText } from "./courseService.js";
import { chatWithContext } from "./aiService.js";

// Lightweight intent detection — good enough to decide WHAT to retrieve
// before calling the AI. This is deliberately simple keyword matching
// rather than another AI call, to keep retrieval fast and predictable.
const detectIntent = (message) => {
  const lower = message.toLowerCase();

  if (/(missing|need|gap).*(skill)/.test(lower) || /skill.*(missing|need)/.test(lower)) {
    return "skill_gap";
  }
  if (/(course|learn|study).*(recommend|suggest|for)/.test(lower) || /recommend.*course/.test(lower)) {
    return "course_recommendation";
  }
  if (/(roadmap|learning path|plan)/.test(lower)) {
    return "roadmap";
  }
  if (/(career|suitable|match|become)/.test(lower)) {
    return "career_match";
  }
  return "general";
};

// Pull a plausible career name mentioned in the message, matched against
// the real Career collection (so we never hallucinate a career either).
const findMentionedCareer = async (message) => {
  const careers = await Career.find({}).select("name");
  const lower = message.toLowerCase();
  return careers.find((c) => lower.includes(c.name.toLowerCase()));
};

/**
 * Handle one chat turn: detect intent, retrieve the real data that intent
 * needs, then hand it all to the AI service to phrase a grounded answer.
 */
export const handleChatMessage = async ({ message, studentProfile = {}, conversationHistory = [] }) => {
  const intent = detectIntent(message);

  let retrievedCareers = [];
  let retrievedCourses = [];

  if (intent === "career_match") {
    const allCareers = await Career.find({});
    retrievedCareers = rankCareerMatches(studentProfile, allCareers, 5);
  }

  if (intent === "skill_gap" || intent === "roadmap") {
    const mentioned = await findMentionedCareer(message);
    const allCareers = await Career.find({});
    const scope = mentioned ? allCareers.filter((c) => c.name === mentioned.name) : allCareers;
    retrievedCareers = rankCareerMatches(studentProfile, scope, mentioned ? 1 : 3);
  }

  if (intent === "course_recommendation") {
    // Prefer the student's stated missing skills / mentioned topic; fall back
    // to a free-text search on the raw message.
    const mentioned = await findMentionedCareer(message);
    if (mentioned) {
      const allCareers = await Career.find({});
      const match = rankCareerMatches(studentProfile, allCareers.filter((c) => c.name === mentioned.name), 1)[0];
      retrievedCourses = await findCoursesBySkills(Course, match?.missingSkills || [], { limit: 8 });
    } else {
      retrievedCourses = await searchCoursesByText(Course, message, { limit: 8 });
    }
  }

  const reply = await chatWithContext({
    message,
    studentProfile,
    retrievedCareers,
    retrievedCourses,
    conversationHistory,
  });

  return {
    reply,
    intent,
    retrievedCareers,
    retrievedCourses,
  };
};
