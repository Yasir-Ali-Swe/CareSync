import { Router } from "express";
import {
  getPatientAppointments,
  getPatientDashboardStats,
  getPatientProfile,
  uploadPatientAvatar,
  updatePatientProfile,
  upsertPatientOnboarding,
} from "../controllers/patient.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireOnboardingCompleted } from "../middlewares/onboarding.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(protect, allowRoles(ROLES.PATIENT));

router.patch("/onboarding", upsertPatientOnboarding);

router.use(requireOnboardingCompleted());

router.get("/profile", getPatientProfile);
router.patch("/profile", updatePatientProfile);
router.post("/profile/avatar", upload.single("avatar"), uploadPatientAvatar);
router.get("/appointments", getPatientAppointments);
router.get("/stats", getPatientDashboardStats);

export default router;
