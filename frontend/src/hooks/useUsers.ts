import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../api/services/users.service";
import type { CreateUserRequest, UpdateUserRequest } from "../api/services/users.service";
import { toast } from "sonner";

export const useUsers = (page = 1, limit = 20, role?: string) => {
  const queryClient = useQueryClient();

  // Get all users
  const usersQuery = useQuery({
    queryKey: ["users", page, limit, role],
    queryFn: () => usersService.getUsers(page, limit, role),
    staleTime: 5 * 60 * 1000,
  });

  // Create user
  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserRequest) => usersService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  // Update user
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  // Activate user
  const activateUserMutation = useMutation({
    mutationFn: (id: string) => usersService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User activated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to activate user");
    },
  });

  // Deactivate user
  const deactivateUserMutation = useMutation({
    mutationFn: (id: string) => usersService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to deactivate user");
    },
  });

  return {
    users: usersQuery.data?.data || [],
    meta: usersQuery.data?.meta,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    activateUserMutation,
    deactivateUserMutation,
  };
};