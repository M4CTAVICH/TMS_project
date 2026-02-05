// src/components/layout/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types/api.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // User doesn't have permission, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
