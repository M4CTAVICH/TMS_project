import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/api.types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
