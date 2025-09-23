// src/services/api.ts
import axios from "axios";

// Use VITE_API_URL if defined, otherwise default to localhost:4000
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// Create Axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // important if backend sets httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: interceptors to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);
