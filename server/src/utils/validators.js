import validator from "validator";
import mongoose from "mongoose";

export const isValidEmail = (value) => validator.isEmail(String(value || ""));

export const isStrongPassword = (value) =>
  validator.isStrongPassword(String(value || ""), {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  });

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

export const assertRequiredFields = (payload, fields = []) => {
  const missing = fields.filter((field) => {
    const value = payload?.[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  return {
    isValid: missing.length === 0,
    missing,
  };
};

const hasUnsafeMongoKey = (key) => key.startsWith("$") || key.includes(".");

const sanitizeInPlace = (value) => {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach((item) => sanitizeInPlace(item));
    return;
  }

  Object.keys(value).forEach((key) => {
    if (hasUnsafeMongoKey(key)) {
      delete value[key];
      return;
    }

    sanitizeInPlace(value[key]);
  });
};

export const sanitizeObject = (value) => {
  sanitizeInPlace(value);
  return value;
};

export const mongoSanitizeMiddleware = (req, res, next) => {
  try {
    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);
    next();
  } catch (error) {
    next(error);
  }
};
