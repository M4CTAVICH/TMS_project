import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "../api/services/orders.service";
import { CreateOrderRequest, OrderStatus, OrderType } from "../types/api.types";
import { toast } from "sonner";

export const useOrders = (params?: {
  userId?: string;
  status?: OrderStatus;
  type?: OrderType;
}) => {
  const queryClient = useQueryClient();

  // Get all orders
  const ordersQuery = useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersService.getOrders(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success(`Order ${order.orderNumber} created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create order");
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update order status");
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (id: string) => ordersService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });

  return {
    orders: ordersQuery.data,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,

    createOrder: createOrderMutation.mutate,
    createOrderAsync: createOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,

    updateOrderStatus: updateOrderStatusMutation.mutate,
    isUpdatingStatus: updateOrderStatusMutation.isPending,

    cancelOrder: cancelOrderMutation.mutate,
    isCancelling: cancelOrderMutation.isPending,
  };
};

// Hook for single order
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersService.getOrderById(id),
    enabled: !!id,
  });
};
