import multer from "multer";

// Files are parsed in-memory and never written to disk — the extracted
// text is what matters, not the original file, so there's nothing to clean
// up afterward and no risk of orphaned uploads accumulating on the server.
const storage = multer.memoryStorage();

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — resumes and resume photos are small

export const DOCUMENT_MIMETYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const IMAGE_MIMETYPES = ["image/jpeg", "image/png", "image/webp"];

export const isImageMimetype = (mimetype) => IMAGE_MIMETYPES.includes(mimetype);

const fileFilter = (req, file, cb) => {
  const allowed = [...DOCUMENT_MIMETYPES, ...IMAGE_MIMETYPES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Please upload a PDF, DOCX, plain text resume, or a photo (JPG/PNG/WEBP)."));
  }
};

export const uploadResumeFile = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
}).single("resume");

// Same allowed types/limits as the resume uploader, reused for chat
// attachments (photo of a certificate, screenshot, PDF, etc.) — just a
// different form field name ("attachment") to match the chat endpoint.
export const uploadChatAttachment = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
}).single("attachment");
