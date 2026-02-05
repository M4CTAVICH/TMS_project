// src/api/services/auth.service.ts
import { apiClient } from "../client";
import { endpoints } from "../endpoints";
import type {
  LoginRequest,
  LoginResponse,
  User,
  ChangePasswordRequest,
  ApiResponse,
} from "../../types/api.types";

export const authService = {
  // Login
  
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        endpoints.auth.login,
        credentials
      );
      // Access the ApiResponse wrapper and get the data
      const loginResponse = response.data as ApiResponse<LoginResponse>;
      const loginData = loginResponse.data as LoginResponse;
      return loginData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      endpoints.auth.profile
    );
    return (response.data as any).data.user;
  },

  // Verify token
  verifyToken: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      endpoints.auth.verifyToken
    );
    return (response.data as any).data.user;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(endpoints.auth.changePassword, data);
  },
};
