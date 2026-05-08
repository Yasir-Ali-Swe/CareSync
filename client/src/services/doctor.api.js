import { api } from "@/lib/axios";

export const doctorApi = {
  submitOnboarding: async (data) => {
    const response = await api.patch("/doctor/onboarding", data);
    return response.data;
  },
  getDoctorProfile: async () => {
    const response = await api.get("/doctor/profile");
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/doctor/stats");
    return response.data;
  },
  getAppointments: async (params = {}) => {
    const response = await api.get("/doctor/appointments", { params });
    return response.data;
  },
};
