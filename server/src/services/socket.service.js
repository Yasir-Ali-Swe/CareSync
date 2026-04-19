const onlineUsers = new Map();

export const socketService = {
  setOnline(userId, socketId) {
    onlineUsers.set(String(userId), socketId);
  },

  setOffline(userId) {
    onlineUsers.delete(String(userId));
  },

  getSocketId(userId) {
    return onlineUsers.get(String(userId));
  },

  getOnlineUserIds() {
    return Array.from(onlineUsers.keys());
  },

  isOnline(userId) {
    return onlineUsers.has(String(userId));
  },
};
