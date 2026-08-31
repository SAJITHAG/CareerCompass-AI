import { geminiModel } from "../config/gemini.js";

// This is the ONLY file that talks to Gemini. It never queries MongoDB
// itself — callers (chatService) must retrieve real career/course/profile
// data first and pass it in as structured context. The system prompt below
// exists specifically to stop the model from inventing course names.
const SYSTEM_INSTRUCTIONS = `You are CareerCompass AI, a career guidance assistant for students.

You will always be given three distinct kinds of data in the prompt:
1. CAREER KNOWLEDGE — facts about careers (required skills, descriptions) from a fixed knowledge base.
2. STUDENT PROFILE — the student's own stated skills, interests, education, and goals.
3. COURSE DATA — real courses retrieved from a MongoDB database (Coursera dataset).

Rules you must always follow:
- NEVER invent, guess, or hallucinate a course name, organization, rating, or URL. Only reference courses that appear verbatim in the COURSE DATA section you're given.
- If no COURSE DATA is provided for a question that needs course recommendations, say so plainly and suggest the student search for a specific skill instead of making one up.
- Base career match percentages and skill gaps only on the CAREER KNOWLEDGE and STUDENT PROFILE given — do not invent statistics.
- Keep answers concise, encouraging, and specific to the student's actual data.
- If the student's question is unrelated to careers, courses, or skills, gently redirect them back to career guidance.`;

/**
 * Send content to Gemini with the system instructions prepended. Accepts
 * an array of parts so callers can mix text and image parts (multimodal)
 * — plain-text callers just pass a single string, handled below.
 * Throws on failure — callers should catch and turn this into a
 * user-friendly "AI service unavailable" error response.
 */
const callGeminiParts = async (parts) => {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error("AI service is not configured (missing GEMINI_API_KEY)");
    err.statusCode = 503;
    throw err;
  }

  const result = await geminiModel.generateContent([{ text: SYSTEM_INSTRUCTIONS }, ...parts]);

  const response = result.response;
  const text = response.text();

  if (!text || !text.trim()) {
    const err = new Error("AI service returned an empty response");
    err.statusCode = 502;
    throw err;
  }

  return text.trim();
};

const callGemini = (userPrompt) => callGeminiParts([{ text: userPrompt }]);

/**
 * Explain why a career matches, in natural language, grounded in the
 * already-computed match result (never re-deriving numbers itself).
 */
export const explainCareerMatch = async (studentProfile, matchResult) => {
  const prompt = `
STUDENT PROFILE:
${JSON.stringify(studentProfile, null, 2)}

CAREER KNOWLEDGE (already-scored match result — do not recompute the percentage):
${JSON.stringify(matchResult, null, 2)}

Task: In 2-4 friendly sentences, explain to the student why "${matchResult.careerName}" is a ${matchResult.matchPercentage}% match for them, referencing their actual matching skills and one concrete next step for a missing skill. Do not mention any course names — none were provided.`;

  return callGemini(prompt);
};

/**
 * Summarize/rank a set of already-retrieved courses in natural language.
 * `courses` MUST be real documents from MongoDB — never generated here.
 */
export const explainCourseRecommendations = async (missingSkills, courses) => {
  if (!courses || courses.length === 0) {
    return "I couldn't find any matching courses in the database for those skills right now. Try searching for a related, more general topic instead.";
  }

  const prompt = `
MISSING SKILLS TO ADDRESS:
${JSON.stringify(missingSkills, null, 2)}

COURSE DATA (real courses retrieved from MongoDB — you may ONLY reference these, exactly as named):
${JSON.stringify(
  courses.slice(0, 8).map((c) => ({
    title: c.title,
    organization: c.organization,
    rating: c.rating,
    difficulty: c.difficulty,
    skills: c.skills,
  })),
  null,
  2
)}

Task: In a short paragraph, recommend 2-3 of these courses to the student and explain briefly why each helps close their skill gap. Use the exact course titles as given. Do not mention any course not listed above.`;

  return callGemini(prompt);
};

const RESUME_EXTRACTION_SCHEMA = `{
  "education": string (highest degree/program mentioned, or "" if none found),
  "experienceLevel": one of "Student", "Fresher", "0-1 years", "1-3 years", "3+ years" (best-fit based on stated experience, default "Student" if unclear),
  "technicalSkills": string[] (technical/programming skills explicitly listed or clearly named),
  "softSkills": string[] (soft skills explicitly listed, e.g. "Communication", "Leadership" — only if stated),
  "interests": string[] (interests or areas of focus explicitly mentioned),
  "favoriteSubjects": string[] (academic subjects mentioned, if any — else empty array),
  "careerGoal": string (an explicitly stated objective/goal line, or "" if none found)
}`;

const RESUME_EXTRACTION_INSTRUCTIONS = `Extract ONLY information explicitly present — do not infer, guess, or add anything not stated. Respond with ONLY the JSON object. No markdown code fences, no explanation, no extra text before or after.`;

/**
 * Extract a structured student profile from raw resume text. This is one
 * of two places (see extractProfileFromResumeImage below) where Gemini's
 * output becomes structured data fed back into the app's own matching
 * engine — so the instructions are strict about not inventing anything.
 */
export const extractProfileFromResumeText = async (resumeText) => {
  // Cap input size — resumes are short documents; a huge or malformed
  // extraction shouldn't balloon token usage or dominate the prompt.
  const truncated = resumeText.slice(0, 8000);

  const prompt = `
RESUME TEXT (raw extracted text — formatting may be imperfect):
"""
${truncated}
"""

Task: Extract a JSON object with exactly these fields, using ONLY information explicitly present in the resume text above.
${RESUME_EXTRACTION_SCHEMA}

${RESUME_EXTRACTION_INSTRUCTIONS}`;

  const raw = await callGemini(prompt);
  return parseAndSanitizeProfileJSON(raw);
};

/**
 * Same extraction, but from a photo/scan of a resume rather than a
 * born-digital file — sent directly to Gemini's multimodal input instead
 * of going through a separate OCR step. Produces the identical profile
 * shape as the text path, so callers (the controller) don't need to know
 * which extraction method was used.
 */
export const extractProfileFromResumeImage = async (base64ImageData, mimeType) => {
  const prompt = `
The attached image is a photo or scan of a student's resume.

Task: Read the resume in the image and extract a JSON object with exactly these fields, using ONLY information you can actually read in the image. If the image is blurry, cropped, or a field isn't visible, leave that field empty rather than guessing.
${RESUME_EXTRACTION_SCHEMA}

${RESUME_EXTRACTION_INSTRUCTIONS}`;

  const raw = await callGeminiParts([
    { text: prompt },
    { inlineData: { data: base64ImageData, mimeType } },
  ]);

  return parseAndSanitizeProfileJSON(raw);
};

const parseAndSanitizeProfileJSON = (raw) => {
  // Gemini sometimes wraps JSON in ```json fences despite instructions —
  // strip those defensively before parsing.
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    const err = new Error("Couldn't extract structured data from that resume. Please try the assessment form directly.");
    err.statusCode = 502;
    throw err;
  }

  return sanitizeExtractedProfile(parsed);
};

const VALID_DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

/**
 * "Type any career" mode. The student typed a career name that isn't in
 * the curated data/careers.js list. Rather than let Gemini freely invent
 * what skills that career needs (ungrounded, irreproducible, and liable to
 * reference a skill name that doesn't exist in the real course dataset —
 * which would make Step 5's course lookup silently return nothing), Gemini
 * is only allowed to SELECT from the exact skill vocabulary already proven
 * to exist in the Coursera dataset (passed in as `vocabulary`, sourced live
 * from the Course collection — see careerController.js). The result is
 * still validated against that same list before use (see
 * sanitizeCustomCareer below) — the prompt constraint is a strong hint,
 * not a guarantee, so nothing here is trusted blindly.
 *
 * The returned shape matches a data/careers.js entry (minus name, which the
 * caller already has) so it can be scored by the exact same deterministic
 * scoreCareerMatch() engine used for curated careers — no separate,
 * AI-derived percentage anywhere in this flow.
 */
export const generateCustomCareerSkills = async (careerName, vocabulary) => {
  const prompt = `
ALLOWED SKILL VOCABULARY (choose ONLY from this exact list of ${vocabulary.length} terms — copy each one exactly as written, same spelling and capitalization; never invent, rename, or slightly reword a term):
${JSON.stringify(vocabulary)}

TASK: A student wants to explore the career "${careerName}", which is not in our curated career database. Using ONLY terms from the ALLOWED SKILL VOCABULARY above, produce:
- "requiredSkills": 3 to 6 terms — the skills most essential to this career
- "optionalSkills": 2 to 4 terms — useful but not essential skills, distinct from requiredSkills
- "relatedInterests": up to 3 terms — general interest areas from the same allowed vocabulary that someone drawn to this career would likely have
- "description": one plain sentence describing the career, in your own words (this field is NOT restricted to the vocabulary)
- "difficultyLevel": exactly one of "Beginner", "Intermediate", "Advanced"

Rules:
- Every entry in requiredSkills, optionalSkills, and relatedInterests MUST be an exact, verbatim, case-sensitive match to an item in ALLOWED SKILL VOCABULARY. Anything that doesn't match exactly will be discarded.
- Even if "${careerName}" seems unrelated to typical tech/business skills, still choose the closest reasonable terms from the allowed list — never return an empty requiredSkills array.
- Respond with ONLY a JSON object with exactly these keys: description, difficultyLevel, requiredSkills, optionalSkills, relatedInterests. No markdown code fences, no explanation, no extra text before or after.`;

  const raw = await callGemini(prompt);
  return sanitizeCustomCareer(raw, vocabulary);
};

const sanitizeCustomCareer = (raw, vocabulary) => {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    const err = new Error("Couldn't generate a skill profile for that career. Please try rephrasing it.");
    err.statusCode = 502;
    throw err;
  }

  // Authoritative filter: keep only terms that exactly match the real
  // dataset vocabulary we sent in. This is what actually enforces "Gemini
  // can't invent skill names" — the prompt instruction alone is not
  // sufficient, since models don't always follow constraints perfectly.
  const vocabSet = new Set(vocabulary);
  const asValidSkillArray = (val) =>
    Array.isArray(val) ? [...new Set(val.filter((v) => typeof v === "string" && vocabSet.has(v)))] : [];

  const requiredSkills = asValidSkillArray(parsed.requiredSkills);
  const optionalSkills = asValidSkillArray(parsed.optionalSkills).filter((s) => !requiredSkills.includes(s));
  const relatedInterests = asValidSkillArray(parsed.relatedInterests);

  if (requiredSkills.length === 0) {
    const err = new Error(
      "Couldn't map that career to any real skills in our course dataset. Try a more specific or more common career name."
    );
    err.statusCode = 422;
    throw err;
  }

  return {
    description:
      typeof parsed.description === "string" && parsed.description.trim()
        ? parsed.description.trim()
        : "A custom career explored outside our curated list — skills below are drawn from real courses in our dataset.",
    difficultyLevel: VALID_DIFFICULTY_LEVELS.includes(parsed.difficultyLevel) ? parsed.difficultyLevel : "Intermediate",
    requiredSkills,
    optionalSkills,
    relatedInterests,
  };
};

const VALID_EXPERIENCE_LEVELS = ["Student", "Fresher", "0-1 years", "1-3 years", "3+ years"];

// Defensive normalization: never trust the shape of AI-generated JSON
// blindly — coerce to the exact types the rest of the app expects.
const sanitizeExtractedProfile = (obj) => {
  const asStringArray = (val) =>
    Array.isArray(val) ? val.filter((v) => typeof v === "string" && v.trim()).map((v) => v.trim()) : [];

  return {
    education: typeof obj.education === "string" ? obj.education.trim() : "",
    experienceLevel: VALID_EXPERIENCE_LEVELS.includes(obj.experienceLevel) ? obj.experienceLevel : "Student",
    technicalSkills: asStringArray(obj.technicalSkills),
    softSkills: asStringArray(obj.softSkills),
    interests: asStringArray(obj.interests),
    favoriteSubjects: asStringArray(obj.favoriteSubjects),
    careerGoal: typeof obj.careerGoal === "string" ? obj.careerGoal.trim() : "",
  };
};

/**
 * General conversational chat, grounded in whatever real data the caller
 * (chatService) has already retrieved for this specific question.
 *
 * Optionally accepts a file the student attached to this turn:
 * - imagePart: a Gemini inlineData part (photo/screenshot) — sent as
 *   multimodal input alongside the text, same pattern as the resume photo
 *   path above.
 * - attachmentText: extracted text from an attached PDF/DOCX/TXT — folded
 *   into the prompt as an extra labeled section.
 * Neither changes the grounding rules above: the model still can't invent
 * courses/careers, it can just also read what's in the attachment.
 */
export const chatWithContext = async ({
  message,
  studentProfile,
  retrievedCareers,
  retrievedCourses,
  conversationHistory,
  attachmentText,
  imagePart,
}) => {
  const prompt = `
CONVERSATION HISTORY (most recent last):
${JSON.stringify(conversationHistory || [], null, 2)}

STUDENT PROFILE:
${JSON.stringify(studentProfile || {}, null, 2)}

CAREER KNOWLEDGE (retrieved for this question, may be empty):
${JSON.stringify(retrievedCareers || [], null, 2)}

COURSE DATA (retrieved for this question from MongoDB, may be empty — only reference these exact courses if present):
${JSON.stringify((retrievedCourses || []).slice(0, 8).map((c) => ({
  title: c.title,
  organization: c.organization,
  rating: c.rating,
  difficulty: c.difficulty,
  skills: c.skills,
  courseUrl: c.courseUrl,
})), null, 2)}
${attachmentText ? `\nATTACHED DOCUMENT (text extracted from a file the student just uploaded to this chat):\n"""\n${attachmentText}\n"""\n` : ""}${imagePart ? "\nThe student also attached an image to this message — read it directly.\n" : ""}
STUDENT'S QUESTION:
"${message}"

Task: Answer the student's question directly, grounded only in the data above${attachmentText || imagePart ? " (including what's in the attached file/image)" : ""}. If they asked for courses and none are in COURSE DATA, say you don't have a matching course and suggest they try a different skill term.`;

  if (imagePart) {
    return callGeminiParts([{ text: prompt }, imagePart]);
  }
  return callGemini(prompt);
};
