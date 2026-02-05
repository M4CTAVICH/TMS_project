import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Format weight
export function formatWeight(kg: number): string {
  return `${kg.toFixed(2)} kg`;
}

// Format distance
export function formatDistance(km: number): string {
  return `${km.toFixed(2)} km`;
}

// Get status badge color
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Order statuses
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PREPARING: "bg-purple-100 text-purple-800",
    IN_TRANSIT: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",

    // Production statuses
    PLANNED: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",

    // Transport job statuses
    SCHEDULED: "bg-yellow-100 text-yellow-800",

    // Vehicle statuses
    AVAILABLE: "bg-green-100 text-green-800",
    IN_USE: "bg-blue-100 text-blue-800",
    MAINTENANCE: "bg-orange-100 text-orange-800",
    INACTIVE: "bg-gray-100 text-gray-800",

    // Payment statuses
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-orange-100 text-orange-800",
  };

  return statusColors[status] || "bg-gray-100 text-gray-800";
}

// Get role display name
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    MANAGER: "Manager",
    RAW_STOCK_MANAGER: "Raw Stock Manager",
    PRODUCTION_CLIENT: "Production Client",
    DISTRIBUTOR: "Distributor",
    TRANSPORT_PROVIDER: "Transport Provider",
  };

  return roleNames[role] || role;
}
