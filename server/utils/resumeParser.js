import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

const SUPPORTED_MIMETYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

export const isSupportedResumeFile = (mimetype) => Boolean(SUPPORTED_MIMETYPES[mimetype]);

/**
 * Extract raw text from a resume file buffer, based on its mimetype.
 * Throws a descriptive error (with statusCode set) on unsupported types
 * or extraction failures — callers should surface err.message directly.
 */
export const extractResumeText = async (buffer, mimetype) => {
  const kind = SUPPORTED_MIMETYPES[mimetype];

  if (!kind) {
    const err = new Error("Unsupported file type. Please upload a PDF, DOCX, or plain text resume.");
    err.statusCode = 400;
    throw err;
  }

  try {
    if (kind === "pdf") {
      // unpdf wraps pdf.js directly and, in testing, extracted text reliably
      // and deterministically across repeated runs on both a reportlab-
      // generated PDF and a real LibreOffice-exported one — pdf-parse
      // (tried first) gave inconsistent errors on identical input across
      // separate runs, so it was dropped in favor of this.
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return text;
    }

    if (kind === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    // txt
    return buffer.toString("utf-8");
  } catch (parseErr) {
    const err = new Error(
      "Couldn't read that file. It may be corrupted, password-protected, or an image-only PDF (try the photo upload option instead)."
    );
    err.statusCode = 422;
    throw err;
  }
};
