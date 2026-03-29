import axios from "axios";

const AUTH_STORAGE_KEY = "carbon-credit-auth";
const TOKEN_STORAGE_KEY = "carbon-credit-token";
const rawApiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const baseURL = `${rawApiUrl.replace(/\/$/, "")}/api`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);

      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
