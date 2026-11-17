import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const UPLOAD_DIRECTORY = path.resolve(
  process.cwd(),
  "storage",
  "working-permits"
);

fs.mkdirSync(UPLOAD_DIRECTORY, {
  recursive: true,
  mode: 0o700,
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedExtensions = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".doc",
  ".docx",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, UPLOAD_DIRECTORY);
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    const uniqueName = crypto.randomUUID();

    callback(
      null,
      `${uniqueName}${extension}`
    );
  },
});

export const uploadWorkingPermitAttachment = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 5,                   // Maximum 5 files
    fields: 20,
    parts: 25,
  },

  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      !allowedMimeTypes.has(file.mimetype) ||
      !allowedExtensions.has(extension)
    ) {
      callback(
        new Error(
          "Invalid file type. Only PDF, Word, JPG, and PNG are allowed."
        )
      );
      return;
    }

    callback(null, true);
  },
});

export { UPLOAD_DIRECTORY };