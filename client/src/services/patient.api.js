import { api } from "@/lib/axios";

export const patientApi = {
  submitOnboarding: async (data) => {
    const config = {};
    
    // If data is FormData, set appropriate headers
    if (data instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }
    
    const response = await api.patch("/patient/onboarding", data, config);
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
