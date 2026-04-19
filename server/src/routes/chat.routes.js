import { Router } from "express";
import {
  getMessages,
  listConversations,
  markConversationSeen,
  sendMessage,
} from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireOnboardingCompleted } from "../middlewares/onboarding.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(protect, requireOnboardingCompleted());

router.get("/conversations", listConversations);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/messages", upload.single("attachment"), sendMessage);
router.patch("/conversations/:conversationId/seen", markConversationSeen);

export default router;
