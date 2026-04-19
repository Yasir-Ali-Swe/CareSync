import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit || 30);

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    readAt: null,
  });

  return res.status(200).json({
    success: true,
    data: {
      unreadCount,
      notifications,
    },
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true },
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  return res.status(200).json({ success: true, data: { notification } });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, readAt: null },
    { $set: { readAt: new Date() } },
  );

  return res.status(200).json({ success: true, message: "All notifications marked as read" });
});
