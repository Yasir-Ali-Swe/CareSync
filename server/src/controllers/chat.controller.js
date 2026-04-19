import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { cloudinaryService } from "../services/cloudinary.service.js";

const ensureParticipant = (conversation, userId) =>
  conversation.participants.some((participantId) => String(participantId) === String(userId));

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate("participants", "_id fullName email profileImageUrl")
    .populate("lastMessage")
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  const mapped = conversations.map((conversation) => {
    const unreadCount = conversation.unreadCounts?.get(String(req.user._id)) || 0;
    return {
      ...conversation.toObject(),
      unreadCount,
    };
  });

  return res.status(200).json({ success: true, data: { conversations: mapped } });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 30);

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !ensureParticipant(conversation, req.user._id)) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return res.status(200).json({ success: true, data: { messages: messages.reverse() } });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, recipientId, text } = req.body;

  let conversation = null;

  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
    if (!conversation || !ensureParticipant(conversation, req.user._id)) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
  } else {
    if (!recipientId) {
      return res.status(400).json({ success: false, message: "recipientId is required" });
    }

    const recipient = await User.findById(recipientId).select("_id");
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, recipientId] });
    }
  }

  if (!text && !req.file) {
    return res.status(400).json({ success: false, message: "Message text or attachment is required" });
  }

  let attachment = null;
  if (req.file) {
    const uploaded = await cloudinaryService.uploadFile(req.file.buffer, "caresync/chat");
    attachment = {
      url: uploaded.secure_url,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: text || "",
    attachment,
  });

  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();

  const unreadCounts = conversation.unreadCounts || new Map();
  for (const participantId of conversation.participants) {
    const key = String(participantId);
    if (key === String(req.user._id)) {
      unreadCounts.set(key, 0);
      continue;
    }
    unreadCounts.set(key, (unreadCounts.get(key) || 0) + 1);
  }

  conversation.unreadCounts = unreadCounts;
  await conversation.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`conversation:${conversation._id}`).emit("message:new", {
      conversationId: conversation._id,
      message,
    });
  }

  return res.status(201).json({ success: true, data: { conversation, message } });
});

export const markConversationSeen = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !ensureParticipant(conversation, req.user._id)) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      "seenBy.user": { $ne: req.user._id },
    },
    {
      $push: { seenBy: { user: req.user._id, seenAt: new Date() } },
    },
  );

  conversation.unreadCounts.set(String(req.user._id), 0);
  await conversation.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`conversation:${conversation._id}`).emit("conversation:seen", {
      conversationId: conversation._id,
      userId: req.user._id,
    });
  }

  return res.status(200).json({ success: true, message: "Conversation marked as seen" });
});
