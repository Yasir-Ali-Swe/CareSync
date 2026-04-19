import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

if (process.env.NODE_ENV === "production") {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  APP_NAME: process.env.APP_NAME || "CareSync",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173/",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/caresync",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
  JWT_VERIFY_EMAIL_SECRET:
    process.env.JWT_VERIFY_EMAIL_SECRET || process.env.JWT_ACCESS_SECRET || "dev_verify_secret",
  JWT_RESET_PASSWORD_SECRET:
    process.env.JWT_RESET_PASSWORD_SECRET || process.env.JWT_ACCESS_SECRET || "dev_reset_secret",

  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  VERIFY_EMAIL_TOKEN_EXPIRES_IN: process.env.VERIFY_EMAIL_TOKEN_EXPIRES_IN || "1d",
  RESET_PASSWORD_TOKEN_EXPIRES_IN: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN || "15m",

  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || "refreshToken",
  ACCESS_COOKIE_NAME: process.env.ACCESS_COOKIE_NAME || "accessToken",

  EMAIL: process.env.EMAIL || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};

export const isProd = env.NODE_ENV === "production";
