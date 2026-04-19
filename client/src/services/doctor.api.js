import { api } from "@/lib/axios";

export const doctorApi = {
  getStats: async () => {
    const response = await api.get("/doctor/stats");
    return response.data;
  },
  getAppointments: async (params = {}) => {
    const response = await api.get("/doctor/appointments", { params });
    return response.data;
  },
};
