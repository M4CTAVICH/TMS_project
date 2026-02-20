import { apiClient } from "../client";
import { endpoints } from "../endpoints";
import type { 
User,
UpdateUserRequest,
UpdateUserRequest,
UsersListResponse,
ApiResponse

 } from "../../types";

 export const usersService = {
  // Create user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      endpoints.users.base,
      userData
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
    const response = await apiClient.put<ApiResponse<{ user: User }>>(
      endpoints.users.byId(id),
      userData
    );
    return (response.data as any).data.user;
  },

  // Activate user
  activateUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      endpoints.users.activate(id)
    );
    return (response.data as any).data.user;
  },

  // Deactivate user
  deactivateUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>(
      endpoints.users.deactivate(id)
    );
    return (response.data as any).data.user;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.users.byId(id));
  },
};