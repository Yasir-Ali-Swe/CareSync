import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { PatientProfile } from "../models/patientProfile.model.js";
import { DoctorProfile } from "../models/doctorProfile.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { emailService } from "../services/email.service.js";
import { tokenService } from "../services/token.service.js";
import { env, isProd } from "../config/env.js";
import { ROLES, USER_STATUS } from "../utils/constants.js";
import { assertRequiredFields, isStrongPassword, isValidEmail } from "../utils/validators.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(env.REFRESH_COOKIE_NAME, refreshCookieOptions);
};

const upsertRoleProfile = async (user) => {
  if (user.role === ROLES.PATIENT) {
    await PatientProfile.updateOne(
      { user: user._id },
      {
        $setOnInsert: {
          user: user._id,
          personalInfo: {
            fullName: user.fullName,
            email: user.email,
          },
        },
      },
      { upsert: true },
    );
  }

  if (user.role === ROLES.DOCTOR) {
    await DoctorProfile.updateOne(
      { user: user._id },
      {
        $setOnInsert: {
          user: user._id,
          personalInfo: {
            fullName: user.fullName,
            email: user.email,
          },
        },
      },
      { upsert: true },
    );
  }
};

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const required = assertRequiredFields(req.body, ["fullName", "email", "password", "role"]);
  if (!required.isValid) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${required.missing.join(", ")}`,
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 chars and include upper, lower, and number",
    });
  }

  if (![ROLES.PATIENT, ROLES.DOCTOR].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    role,
    status: USER_STATUS.ACTIVE,
  });

  await upsertRoleProfile(user);

  const verifyToken = tokenService.generateEmailVerificationToken({ sub: String(user._id), email: user.email });
  const verifyTokenHash = tokenService.hashToken(verifyToken);
  const decoded = jwt.decode(verifyToken);

  user.emailVerificationTokenHash = verifyTokenHash;
  user.emailVerificationTokenExpiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
  await user.save();

  await emailService.sendVerificationEmail(user.email, verifyToken, user.fullName);

  return res.status(201).json({
    success: true,
    message: "Registered successfully. Please verify your email.",
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const required = assertRequiredFields(req.body, ["email", "password"]);
  if (!required.isValid) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${required.missing.join(", ")}`,
    });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password +refreshTokenHash");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({ success: false, message: "Please verify your email first" });
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    return res.status(403).json({ success: false, message: "Account is not active" });
  }

  const payload = { sub: String(user._id), role: user.role };
  const { accessToken, refreshToken } = tokenService.generateAuthTokens(payload);

  user.refreshTokenHash = tokenService.hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[env.REFRESH_COOKIE_NAME];

  if (!incomingToken) {
    return res.status(401).json({ success: false, message: "Refresh token missing" });
  }

  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(incomingToken);
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }

  const user = await User.findById(decoded.sub).select("+refreshTokenHash role status");
  if (!user || !user.refreshTokenHash) {
    return res.status(401).json({ success: false, message: "Session invalid" });
  }

  const incomingHash = tokenService.hashToken(incomingToken);
  if (incomingHash !== user.refreshTokenHash) {
    return res.status(401).json({ success: false, message: "Refresh token mismatch" });
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    return res.status(403).json({ success: false, message: "Account is not active" });
  }

  const payload = { sub: String(user._id), role: user.role };
  const { accessToken, refreshToken: newRefreshToken } = tokenService.generateAuthTokens(payload);

  user.refreshTokenHash = tokenService.hashToken(newRefreshToken);
  await user.save();

  setRefreshCookie(res, newRefreshToken);

  return res.status(200).json({
    success: true,
    message: "Token refreshed",
    data: { accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.[env.REFRESH_COOKIE_NAME];

  if (incomingToken) {
    try {
      const decoded = tokenService.verifyRefreshToken(incomingToken);
      await User.findByIdAndUpdate(decoded.sub, { $set: { refreshTokenHash: null } });
    } catch (error) {
      // Ignore invalid token and still clear cookie
    }
  }

  clearRefreshCookie(res);

  return res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token || req.query.token;

  if (!token) {
    return res.status(400).json({ success: false, message: "Verification token is required" });
  }

  let decoded;
  try {
    decoded = tokenService.verifyEmailToken(token);
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
  }

  const user = await User.findById(decoded.sub).select(
    "+emailVerificationTokenHash +emailVerificationTokenExpiresAt",
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const tokenHash = tokenService.hashToken(token);
  if (user.emailVerificationTokenHash !== tokenHash) {
    return res.status(400).json({ success: false, message: "Verification token mismatch" });
  }

  if (user.emailVerificationTokenExpiresAt && user.emailVerificationTokenExpiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "Verification token expired" });
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationTokenExpiresAt = null;
  await user.save();

  return res.status(200).json({ success: true, message: "Email verified successfully" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });

  if (user) {
    const resetToken = tokenService.generateResetPasswordToken({ sub: String(user._id), email: user.email });
    const resetTokenHash = tokenService.hashToken(resetToken);
    const decoded = jwt.decode(resetToken);

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetTokenExpiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
    await user.save();

    await emailService.sendResetPasswordEmail(user.email, resetToken, user.fullName);
  }

  return res.status(200).json({
    success: true,
    message: "If this email exists, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token || req.query.token;
  const { password, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Reset token is required" });
  }

  if (!password || !confirmPassword) {
    return res.status(400).json({ success: false, message: "Password and confirm password are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 chars and include upper, lower, and number",
    });
  }

  let decoded;
  try {
    decoded = tokenService.verifyResetToken(token);
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
  }

  const user = await User.findById(decoded.sub).select(
    "+passwordResetTokenHash +passwordResetTokenExpiresAt +password",
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const incomingHash = tokenService.hashToken(token);
  if (user.passwordResetTokenHash !== incomingHash) {
    return res.status(400).json({ success: false, message: "Reset token mismatch" });
  }

  if (user.passwordResetTokenExpiresAt && user.passwordResetTokenExpiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "Reset token expired" });
  }

  user.password = password;
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;
  user.refreshTokenHash = null;
  await user.save();

  clearRefreshCookie(res);

  return res.status(200).json({ success: true, message: "Password reset successful" });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("_id fullName email role status isEmailVerified");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({ success: true, data: { user } });
});
