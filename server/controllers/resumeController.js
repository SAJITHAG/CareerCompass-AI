import { extractResumeText } from "../utils/resumeParser.js";
import { extractProfileFromResumeText, extractProfileFromResumeImage } from "../services/aiService.js";
import { isImageMimetype } from "../middleware/upload.js";

// POST /api/profile/from-resume  (requires auth, multipart file upload)
// Accepts either a document (PDF/DOCX/TXT — text extracted then sent to
// Gemini) or a photo/scan (sent directly to Gemini's multimodal input,
// skipping OCR entirely). Both paths converge on the same extracted
// profile shape. Returns the extracted profile for the frontend to
// pre-fill the assessment form with — it is NOT auto-saved, so the student
// can review and correct it before it's used for matching.
export const parseResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file was uploaded." });
    }

    let extractedProfile;

    if (isImageMimetype(req.file.mimetype)) {
      const base64Image = req.file.buffer.toString("base64");
      extractedProfile = await extractProfileFromResumeImage(base64Image, req.file.mimetype);
    } else {
      const resumeText = await extractResumeText(req.file.buffer, req.file.mimetype);

      if (!resumeText || resumeText.trim().length < 30) {
        return res.status(422).json({
          success: false,
          message: "Couldn't find enough readable text in that file. If it's a scanned or image-based PDF, try the photo upload option instead.",
        });
      }

      extractedProfile = await extractProfileFromResumeText(resumeText);
    }

    res.json({ success: true, data: extractedProfile });
  } catch (err) {
    // extractResumeText and the AI extraction functions attach statusCode
    // for known failure modes (bad file type, unreadable file, AI unavailable,
    // AI returned unparseable output) — surface those messages directly.
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};
