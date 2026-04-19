import { Router } from "express";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", listNotifications);
router.patch("/:notificationId/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);

export default router;
