import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./endpoints";
import type { ApiError, ApiResponse } from "../types/api.types";

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
    const token = localStorage.getItem("auth_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
