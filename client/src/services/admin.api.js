import { api } from "@/lib/axios";

export const adminApi = {
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },
  getUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },
};
