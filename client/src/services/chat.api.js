import { api } from "@/lib/axios";

export const chatApi = {
  getConversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },
  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params,
    });
    return response.data;
  },
  sendMessage: async (payload) => {
    const { attachment, ...rest } = payload;

    if (attachment) {
      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      formData.append("attachment", attachment);

      const response = await api.post("/chat/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }

    const response = await api.post("/chat/messages", rest);
    return response.data;
  },
  markSeen: async (conversationId) => {
    const response = await api.patch(`/chat/conversations/${conversationId}/seen`);
    return response.data;
  },
};
