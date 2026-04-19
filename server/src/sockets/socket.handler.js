import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { isOnboardingCompletedForUser } from "../middlewares/onboarding.middleware.js";
import { socketService } from "../services/socket.service.js";
import { tokenService } from "../services/token.service.js";
import { USER_STATUS } from "../utils/constants.js";

const extractSocketToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return authToken;

  const headerAuth = socket.handshake?.headers?.authorization || "";
  if (headerAuth.startsWith("Bearer ")) {
    return headerAuth.split(" ")[1];
  }

  return null;
};

export const registerSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = extractSocketToken(socket);
      if (!token) {
        return next(new Error("Unauthorized: missing token"));
      }

      const decoded = tokenService.verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select(
        "_id role status isEmailVerified fullName email",
      );

      if (!user) {
        return next(new Error("Unauthorized: invalid user"));
      }

      if (!user.isEmailVerified) {
        return next(new Error("Forbidden: email verification required"));
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        return next(new Error("Forbidden: inactive account"));
      }

      const onboardingCompleted = await isOnboardingCompletedForUser(user);
      if (!onboardingCompleted) {
        return next(new Error("Forbidden: onboarding required"));
      }

      socket.data.userId = String(user._id);
      socket.data.role = user.role;

      return next();
    } catch (error) {
      return next(new Error("Unauthorized socket connection"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    socketService.setOnline(userId, socket.id);
    socket.join(`user:${userId}`);
    io.emit("presence:online-users", socketService.getOnlineUserIds());

    socket.on("conversation:join", ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("typing:start", ({ conversationId }) => {
      if (!conversationId || !socket.data.userId) return;
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        conversationId,
        userId: socket.data.userId,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      if (!conversationId || !socket.data.userId) return;
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        conversationId,
        userId: socket.data.userId,
      });
    });

    socket.on("message:send", async ({ conversationId, text, attachment }) => {
      try {
        if (!conversationId || !socket.data.userId || (!text && !attachment)) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (participantId) => String(participantId) === String(socket.data.userId),
        );

        if (!isParticipant) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.data.userId,
          text: text || "",
          attachment: attachment || null,
        });

        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();

        const unreadCounts = conversation.unreadCounts || new Map();
        for (const participantId of conversation.participants) {
          const key = String(participantId);
          if (key === String(socket.data.userId)) {
            unreadCounts.set(key, 0);
            continue;
          }
          unreadCounts.set(key, (unreadCounts.get(key) || 0) + 1);
        }

        conversation.unreadCounts = unreadCounts;
        await conversation.save();

        io.to(`conversation:${conversationId}`).emit("message:new", {
          conversationId,
          message,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("message:seen", async ({ conversationId }) => {
      try {
        if (!conversationId || !socket.data.userId) return;

        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.data.userId },
            "seenBy.user": { $ne: socket.data.userId },
          },
          {
            $push: { seenBy: { user: socket.data.userId, seenAt: new Date() } },
          },
        );

        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { [`unreadCounts.${socket.data.userId}`]: 0 },
        });

        io.to(`conversation:${conversationId}`).emit("conversation:seen", {
          conversationId,
          userId: socket.data.userId,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to update seen status" });
      }
    });

    socket.on("disconnect", () => {
      if (socket.data.userId) {
        socketService.setOffline(socket.data.userId);
        io.emit("presence:online-users", socketService.getOnlineUserIds());
      }
    });
  });
};
