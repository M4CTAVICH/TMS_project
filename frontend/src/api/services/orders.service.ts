// src/api/services/orders.service.ts
import { apiClient } from "../client";
import { endpoints } from "../endpoints";
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderStatus,
  OrderType,
  ApiResponse,
} from "../../types/api.types";

export const ordersService = {
  // Get all orders
  getOrders: async (params?: {
    userId?: string;
    status?: OrderStatus;
    type?: OrderType;
  }): Promise<Order[]> => {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append("userId", params.userId);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);

    const response = await apiClient.get<ApiResponse<{ orders: Order[] }>>(
      `${endpoints.orders.base}?${queryParams}`
    );
    return (response.data as any).data.orders;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<{ order: Order }>>(
      endpoints.orders.byId(id)
    );
    return (response.data as any).data.order;
  },

  // Create order
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      endpoints.orders.base,
      data
    );
    return (response.data as any).data.order;
  },

  // Update order status
  updateOrderStatus: async (
    id: string,
    status: OrderStatus
  ): Promise<Order> => {
    const response = await apiClient.put<ApiResponse<{ order: Order }>>(
      endpoints.orders.updateStatus(id),
      { status }
    );
    return (response.data as any).data.order;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<{ order: Order }>>(
      endpoints.orders.cancel(id)
    );
    return (response.data as any).data.order;
  },
};
