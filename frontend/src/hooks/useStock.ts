import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockService } from "../api/services/stock.service";
import { UpdateStockRequest } from "../types/api.types";
import { toast } from "sonner";

export const useRawMaterialStock = (params?: {
  locationId?: string;
  productId?: string;
}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["stock", "raw-material", params],
    queryFn: () => stockService.getRawMaterialStock(params),
    staleTime: 30 * 1000, // 30 seconds
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      locationId,
      data,
    }: {
      productId: string;
      locationId: string;
      data: UpdateStockRequest;
    }) => stockService.updateRawMaterialStock(productId, locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", "raw-material"] });
      toast.success("Raw material stock updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stock");
    },
  });

  return {
    stock: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateStock: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

export const useProductionStock = (params?: {
  locationId?: string;
  productId?: string;
}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["stock", "production", params],
    queryFn: () => stockService.getProductionStock(params),
    staleTime: 30 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      locationId,
      data,
    }: {
      productId: string;
      locationId: string;
      data: UpdateStockRequest;
    }) => stockService.updateProductionStock(productId, locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock", "production"] });
      toast.success("Production stock updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stock");
    },
  });

  return {
    stock: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateStock: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

export const useFinishedProductStock = (params?: {
  locationId?: string;
  productId?: string;
}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["stock", "finished-product", params],
    queryFn: () => stockService.getFinishedProductStock(params),
    staleTime: 30 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      locationId,
      data,
    }: {
      productId: string;
      locationId: string;
      data: UpdateStockRequest;
    }) => stockService.updateFinishedProductStock(productId, locationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stock", "finished-product"],
      });
      toast.success("Finished product stock updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stock");
    },
  });

  return {
    stock: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateStock: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

export const useStockOverview = () => {
  return useQuery({
    queryKey: ["stock", "overview"],
    queryFn: stockService.getStockOverview,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
