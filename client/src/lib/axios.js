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

    // Prevent infinite loops by:
    // 1. Check if _retry flag is set (request already retried)
    // 2. Ensure it's a 401 error (unauthorized)
    // 3. Exclude refresh endpoint from retry logic (skipRefreshRetry flag)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipRefreshRetry
    ) {
      originalRequest._retry = true;

      try {
        const auth = await getAuthApi();
        
        // Mark refresh request to skip retry logic if it also fails with 401
        const refreshResponse = await auth.refreshToken();
        const newAccessToken = refreshResponse?.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout and redirect to login
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
