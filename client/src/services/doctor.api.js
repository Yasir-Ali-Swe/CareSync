import { api } from "@/lib/axios";

export const doctorApi = {
  submitOnboarding: async (data) => {
    const config = {};
    
    // If data is FormData, set appropriate headers
    if (data instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }
    
    const response = await api.patch("/doctor/onboarding", data, config);
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
