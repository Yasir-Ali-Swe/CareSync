import { Router } from "express";
import {
  createUser,
  getAdminProfile,
  getAdminStats,
  listUsers,
  updateAdminProfile,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(protect, allowRoles(ROLES.ADMIN));

router.post("/users", createUser);
router.get("/profile", getAdminProfile);
router.patch("/profile", upload.single("avatar"), updateAdminProfile);
router.get("/users", listUsers);
router.patch("/users/:userId/status", updateUserStatus);
router.get("/stats", getAdminStats);

export default router;
