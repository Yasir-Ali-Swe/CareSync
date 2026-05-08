import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let authApi = null;

// Lazy load authApi to avoid circular dependency
async function getAuthApi() {
  if (!authApi) {
    const module = await import("@/services/auth.api.js");
    authApi = module.authApi;
  }
  return authApi;
}
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const auth = await getAuthApi();
        const refreshResponse = await auth.refreshToken();
        const newAccessToken = refreshResponse?.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
