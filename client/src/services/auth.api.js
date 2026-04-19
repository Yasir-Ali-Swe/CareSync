import { api } from "@/lib/axios";

export const authApi = {
  login: async (payload) => {
    const response = await api.post("/auth/login", payload);
    return response.data;
  },
  register: async (payload) => {
    const response = await api.post("/auth/register", payload);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },
  forgotPassword: async (payload) => {
    const response = await api.post("/auth/forgot-password", payload);
    return response.data;
  },
  resetPassword: async (token, payload) => {
    const response = await api.post(`/auth/reset-password/${token}`, payload);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  getOnboardingStatus: async (role) => {
    if (role === "admin") {
      return true;
    }

    try {
      if (role === "patient") {
        await api.get("/patient/profile");
        return true;
      }

      if (role === "doctor") {
        await api.get("/doctor/profile");
        return true;
      }

      return false;
    } catch (error) {
      const code = error?.response?.data?.code;
      const message = String(error?.response?.data?.message || "").toLowerCase();

      if (code === "ONBOARDING_REQUIRED" || message.includes("onboarding")) {
        return false;
      }

      throw error;
    }
  },
};

export const getDashboardRouteByRole = (role) => {
  switch (role) {
    case "patient":
      return "/dashboard/patient/stats";
    case "doctor":
      return "/dashboard/doctor/stats";
    case "admin":
      return "/dashboard/admin/stats";
    default:
      return "/";
  }
};
