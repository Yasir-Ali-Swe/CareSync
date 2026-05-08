import multer from "multer";

const storage = multer.memoryStorage();

const MIME_WHITELISTS = {
  avatar: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  certificate: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ],
  attachment: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const getAllowedMimeTypes = (fieldname) => MIME_WHITELISTS[fieldname] || null;

const fileFilter = (req, file, cb) => {
  if (!file.mimetype) {
    return cb(new Error("Invalid file"), false);
  }

  const allowedMimeTypes = getAllowedMimeTypes(file.fieldname);
  if (!allowedMimeTypes) {
    return cb(new Error(`Unsupported upload field: ${file.fieldname}`), false);
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(`Unsupported file type for ${file.fieldname}: ${file.mimetype}`),
      false,
    );
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
