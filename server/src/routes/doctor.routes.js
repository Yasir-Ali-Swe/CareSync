import { Router } from "express";
import {
  getDoctorAppointments,
  getDoctorById,
  getDoctorDashboardStats,
  getDoctorProfile,
  listDoctors,
  uploadDoctorAvatar,
  uploadDoctorCertificate,
  updateDoctorAvailability,
  updateDoctorProfile,
  upsertDoctorOnboarding,
} from "../controllers/doctor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireOnboardingCompleted } from "../middlewares/onboarding.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.get("/public", listDoctors);
router.get("/public/:doctorId", getDoctorById);

router.use(protect, allowRoles(ROLES.DOCTOR));

router.patch("/onboarding", upsertDoctorOnboarding);

router.use(requireOnboardingCompleted());

router.get("/profile", getDoctorProfile);
router.patch("/profile", updateDoctorProfile);
router.post("/profile/avatar", upload.single("avatar"), uploadDoctorAvatar);
router.post("/profile/certificates", upload.single("certificate"), uploadDoctorCertificate);
router.patch("/availability", updateDoctorAvailability);
router.get("/appointments", getDoctorAppointments);
router.get("/stats", getDoctorDashboardStats);

export default router;
