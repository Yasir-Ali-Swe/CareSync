import { Router } from "express";
import { getAdminStats, listUsers, updateUserStatus } from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(protect, allowRoles(ROLES.ADMIN));

router.get("/users", listUsers);
router.patch("/users/:userId/status", updateUserStatus);
router.get("/stats", getAdminStats);

export default router;
