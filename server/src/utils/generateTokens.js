import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN });

export const generateEmailVerificationToken = (payload) =>
  jwt.sign(payload, env.JWT_VERIFY_EMAIL_SECRET, {
    expiresIn: env.VERIFY_EMAIL_TOKEN_EXPIRES_IN,
  });

export const generateResetPasswordToken = (payload) =>
  jwt.sign(payload, env.JWT_RESET_PASSWORD_SECRET, {
    expiresIn: env.RESET_PASSWORD_TOKEN_EXPIRES_IN,
  });

export const generateAuthTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};
