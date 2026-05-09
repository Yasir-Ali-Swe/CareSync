import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  refreshToken,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  authRateLimit,
  loginAccountRateLimit,
  loginIpRateLimit,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authRateLimit, register);
// Login uses two layers: the account limiter is the primary guard, and the IP limiter is a secondary abuse-control signal.
router.post("/login", loginAccountRateLimit, loginIpRateLimit, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", authRateLimit, forgotPassword);
router.post("/reset-password/:token", authRateLimit, resetPassword);
router.get("/me", protect, me);

export default router;
