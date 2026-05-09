import rateLimit from "express-rate-limit";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const getRequestIp = (req) =>
  String(req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "")
    .trim()
    .replace(/^::ffff:/, "") || "unknown-ip";

const getLoginEmailKey = (req) => normalizeEmail(req.body?.email) || "unknown-email";

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});

export const loginIpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRequestIp,
  message: { success: false, message: "Too many attempts, please try again later." },
});

export const loginAccountRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: getLoginEmailKey,
  message: { success: false, message: "Too many attempts, please try again later." },
});
