import { api } from "@/lib/axios";

export const patientApi = {
  submitOnboarding: async (data) => {
    const config = {};

    // If data is FormData, do NOT set Content-Type here —
    // let the browser/axios set the multipart boundary automatically.
    
    const response = await api.patch("/patient/onboarding", data, config);
    return response.data;
  },
  updatePatientProfile: async (data) => {
    const config = {};

    const response = await api.patch("/patient/profile", data, config);
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
