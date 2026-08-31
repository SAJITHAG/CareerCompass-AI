import express from "express";
import multer from "multer";
import { parseResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/auth.js";
import { uploadResumeFile } from "../middleware/upload.js";

const router = express.Router();

// Wrap multer so its errors (file too large, wrong type, no file) become
// the same { success, message } JSON shape as the rest of the API instead
// of an unhandled exception or multer's default plaintext error.
const handleUpload = (req, res, next) => {
  uploadResumeFile(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "That file is too large. Please upload a resume under 5MB."
          : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post("/from-resume", protect, handleUpload, parseResume);

export default router;
