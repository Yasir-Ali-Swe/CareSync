import { api } from "@/lib/axios";

export const doctorApi = {
  submitOnboarding: async (data) => {
    const config = {};

    // If data is FormData, do NOT set Content-Type here —
    // let the browser/axios set the multipart boundary automatically.
    
    const response = await api.patch("/doctor/onboarding", data, config);
    return response.data;
  },
  updateDoctorProfile: async (data) => {
    const config = {};

    const response = await api.patch("/doctor/profile", data, config);
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
