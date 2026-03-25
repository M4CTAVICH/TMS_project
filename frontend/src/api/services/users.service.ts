import { apiClient } from "../client";
import { endpoints } from "../endpoints";
import { useAuthStore } from "../../store/authStore";
import type { 
User,
UpdateUserRequest,
UpdateUserRequest,
UsersListResponse,
ApiResponse

 } from "../../types";

const getAuthToken = () => {
  let token = localStorage.getItem("auth_token");
  if (!token) {
    try {
      const authState = useAuthStore.getState();
      token = authState.token;
      if (token) {
        localStorage.setItem("auth_token", token);
        console.log("Token retrieved from store and set in localStorage");
      }
    } catch (error) {
      console.error("Failed to get token from auth store:", error);
    }
  }
  if (!token) {
    console.warn("No authentication token available for user API calls");
  }
  return token;
};

 export const usersService = {
  // Create user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    console.log("Creating user with data:", userData);
    const token = getAuthToken();
    console.log("Token for user creation:", token ? "✓ Present" : "✗ Missing");
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      endpoints.users.base,
      userData,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return (response.data as any).data.user;
  },

  // Get all users
  getUsers: async (page = 1, limit = 20, role?: string): Promise<UsersListResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (role) params.append("role", role);

    const response = await apiClient.get<ApiResponse<User[]>>(
      `${endpoints.users.base}?${params.toString()}`
    );
    const data = response.data as any;
    return {
      data: data.data,
      meta: data.meta,
    };
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      endpoints.users.byId(id)
    );
    return (response.data as any).data.user;
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const token = getAuthToken();
    const response = await apiClient.put<ApiResponse<{ user: User }>>(
      endpoints.users.byId(id),
      userData,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return (response.data as any).data.user;
  },

  // Activate user
  activateUser: async (id: string): Promise<User> => {
    const token = getAuthToken();
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      endpoints.users.activate(id),
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return (response.data as any).data.user;
  },

  // Deactivate user
  deactivateUser: async (id: string): Promise<User> => {
    const token = getAuthToken();
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      endpoints.users.deactivate(id),
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return (response.data as any).data.user;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    const token = getAuthToken();
    await apiClient.delete(endpoints.users.byId(id), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  // Get users by location
  getUsersByLocation: async (locationId: string): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${endpoints.users.base}?locationId=${locationId}`
    );
    const data = response.data as any;
    return Array.isArray(data.data) ? data.data : [];
  },
};