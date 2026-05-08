import { api } from "@/lib/axios";

export const patientApi = {
  submitOnboarding: async (data) => {
    const response = await api.patch("/patient/onboarding", data);
    return response.data;
  },
  getPatientProfile: async () => {
    const response = await api.get("/patient/profile");
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/patient/stats");
    return response.data;
  },
  getAppointments: async (params = {}) => {
    const response = await api.get("/patient/appointments", { params });
    return response.data;
  },
};
