import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "The banking intelligence service is temporarily unavailable.";
    return Promise.reject(new Error(typeof message === "string" ? message : JSON.stringify(message)));
  },
);

export default api;
