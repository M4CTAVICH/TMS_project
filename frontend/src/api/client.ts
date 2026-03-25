import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./endpoints";
import type { ApiError, ApiResponse } from "../types/api.types";
import { useAuthStore } from "../store/authStore";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try to get token from localStorage first (most reliable during SSR/SSG)
    let token = localStorage.getItem("auth_token");
    
    // If not in localStorage, try auth store
    if (!token) {
      try {
        const authState = useAuthStore.getState();
        token = authState.token;
      } catch (error) {
        console.warn("Failed to get token from auth store:", error);
      }
    }

    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any;
    }

    // Add token to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No authentication token available for request to", config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Don't unwrap here - let the services handle the ApiResponse wrapper
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const apiError = error.response.data;

      if (error.response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      return Promise.reject({
        success: false,
        message: apiError?.message || "An error occurred",
        statusCode: error.response.status,
        errors: apiError?.errors || [],
      } as ApiError);
    } else if (error.request) {
      return Promise.reject({
        success: false,
        message: "No response from server. Please check your connection.",
        statusCode: 0,
        errors: [],
      } as ApiError);
    } else {
      return Promise.reject({
        success: false,
        message: error.message || "An unexpected error occurred",
        statusCode: 0,
        errors: [],
      } as ApiError);
    }
  }
);

export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  return response.data;
};
