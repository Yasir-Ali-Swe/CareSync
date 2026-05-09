import { api } from "@/lib/axios";

export const adminApi = {
  getProfile: async () => {
    const response = await api.get("/admin/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.patch("/admin/profile", data);
    return response.data;
  },
  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },
  getUsers: async (params = {}) => {
    const { page = 1, limit = 20, ...rest } = params;
    const response = await api.get("/admin/users", {
      params: { page, limit, ...rest },
    });
    return response.data;
  },
};
