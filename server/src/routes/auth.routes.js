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
import { authRateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, me);

export default router;
