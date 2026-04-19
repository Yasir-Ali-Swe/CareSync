import { Router } from "express";
import {
  bookAppointment,
  cancelAppointment,
  doctorUpdateAppointmentStatus,
  listAppointments,
} from "../controllers/appointment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireOnboardingCompleted } from "../middlewares/onboarding.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(protect, requireOnboardingCompleted());

router.get("/", listAppointments);
router.post("/", allowRoles(ROLES.PATIENT), bookAppointment);
router.patch("/:appointmentId/cancel", allowRoles(ROLES.PATIENT, ROLES.ADMIN), cancelAppointment);
router.patch(
  "/:appointmentId/status",
  allowRoles(ROLES.DOCTOR, ROLES.ADMIN),
  doctorUpdateAppointmentStatus,
);

export default router;
