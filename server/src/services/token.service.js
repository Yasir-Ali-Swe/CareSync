import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import {
  generateAuthTokens,
  generateEmailVerificationToken,
  generateResetPasswordToken,
} from "../utils/generateTokens.js";

export const tokenService = {
  generateAuthTokens,
  generateEmailVerificationToken,
  generateResetPasswordToken,

  verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  },

  verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  },

  verifyEmailToken(token) {
    return jwt.verify(token, env.JWT_VERIFY_EMAIL_SECRET);
  },

  verifyResetToken(token) {
    return jwt.verify(token, env.JWT_RESET_PASSWORD_SECRET);
  },

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  },
};
