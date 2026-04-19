import { api } from "@/lib/axios";

export const appointmentApi = {
  list: async (params = {}) => {
    const response = await api.get("/appointments", { params });
    return response.data;
  },
  book: async (payload) => {
    const response = await api.post("/appointments", payload);
    return response.data;
  },
  cancel: async (appointmentId, payload = {}) => {
    const response = await api.patch(`/appointments/${appointmentId}/cancel`, payload);
    return response.data;
  },
  updateStatus: async (appointmentId, payload) => {
    const response = await api.patch(`/appointments/${appointmentId}/status`, payload);
    return response.data;
  },
};
