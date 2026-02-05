import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsService } from "../api/services/products.service";
import type { CreateProductRequest, ProductType } from "../types/api.types";
import { toast } from "sonner";

export const useProducts = (page = 1, limit = 20, type?: ProductType) => {
  const queryClient = useQueryClient();

  // Get all products
  const productsQuery = useQuery({
    queryKey: ["products", page, limit, type],
    queryFn: () => productsService.getProducts(page, limit, type),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get raw materials
  const rawMaterialsQuery = useQuery({
    queryKey: ["products", "raw-materials", page, limit],
    queryFn: () => productsService.getRawMaterials(page, limit),
    enabled: false, // Only fetch when explicitly called
  });

  // Get finished products
  const finishedProductsQuery = useQuery({
    queryKey: ["products", "finished-products", page, limit],
    queryFn: () => productsService.getFinishedProducts(page, limit),
    enabled: false, // Only fetch when explicitly called
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductRequest) =>
      productsService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductRequest>;
    }) => productsService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  return {
    products: productsQuery.data?.products,
    meta: productsQuery.data?.meta,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,

    rawMaterials: rawMaterialsQuery.data?.products,
    loadRawMaterials: rawMaterialsQuery.refetch,
    isLoadingRawMaterials: rawMaterialsQuery.isLoading,

    finishedProducts: finishedProductsQuery.data?.products,
    loadFinishedProducts: finishedProductsQuery.refetch,
    isLoadingFinishedProducts: finishedProductsQuery.isLoading,

    createProduct: createProductMutation.mutate,
    isCreating: createProductMutation.isPending,

    updateProduct: updateProductMutation.mutate,
    isUpdating: updateProductMutation.isPending,

    deleteProduct: deleteProductMutation.mutate,
    isDeleting: deleteProductMutation.isPending,
  };
};

// Hook for single product
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsService.getProductById(id),
    enabled: !!id,
  });
};
