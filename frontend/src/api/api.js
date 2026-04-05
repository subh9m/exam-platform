// src/api/api.js
import axios from "axios";

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").trim();
const sanitizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");
const apiBaseUrl = sanitizedApiBaseUrl.endsWith("/api")
  ? sanitizedApiBaseUrl
  : `${sanitizedApiBaseUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
});

// ✅ Automatically add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
