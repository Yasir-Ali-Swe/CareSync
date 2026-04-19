import { api } from "@/lib/axios";

export const patientApi = {
  getStats: async () => {
    const response = await api.get("/patient/stats");
    return response.data;
  },
  getAppointments: async (params = {}) => {
    const response = await api.get("/patient/appointments", { params });
    return response.data;
  },
};
