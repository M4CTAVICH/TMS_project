// src/api/services/stock.service.ts
import { apiClient } from "../client";
import { endpoints } from "../endpoints";
import type {
  RawMaterialStock,
  ProductionStock,
  FinishedProductStock,
  UpdateStockRequest,
  StockOverview,
  ApiResponse,
} from "../../types/api.types";

export const stockService = {
  // Raw Material Stock
  getRawMaterialStock: async (params?: {
    locationId?: string;
    productId?: string;
  }): Promise<RawMaterialStock[]> => {
    const queryParams = new URLSearchParams();
    if (params?.locationId) queryParams.append("locationId", params.locationId);
    if (params?.productId) queryParams.append("productId", params.productId);

    const response = await apiClient.get<
      ApiResponse<{ stock: RawMaterialStock[] }>
    >(`${endpoints.stock.rawMaterial}?${queryParams}`);
    return (response.data as any).data.stock;
  },

  updateRawMaterialStock: async (
    productId: string,
    locationId: string,
    data: UpdateStockRequest
  ): Promise<RawMaterialStock> => {
    const response = await apiClient.put<
      ApiResponse<{ stock: RawMaterialStock }>
    >(endpoints.stock.updateRawMaterial(productId, locationId), data);
    return (response.data as any).data.stock;
  },

  // Production Stock
  getProductionStock: async (params?: {
    locationId?: string;
    productId?: string;
  }): Promise<ProductionStock[]> => {
    const queryParams = new URLSearchParams();
    if (params?.locationId) queryParams.append("locationId", params.locationId);
    if (params?.productId) queryParams.append("productId", params.productId);

    const response = await apiClient.get<
      ApiResponse<{ stock: ProductionStock[] }>
    >(`${endpoints.stock.production}?${queryParams}`);
    return (response.data as any).data.stock;
  },

  updateProductionStock: async (
    productId: string,
    locationId: string,
    data: UpdateStockRequest
  ): Promise<ProductionStock> => {
    const response = await apiClient.put<
      ApiResponse<{ stock: ProductionStock }>
    >(endpoints.stock.updateProduction(productId, locationId), data);
    return (response.data as any).data.stock;
  },

  // Finished Product Stock
  getFinishedProductStock: async (params?: {
    locationId?: string;
    productId?: string;
  }): Promise<FinishedProductStock[]> => {
    const queryParams = new URLSearchParams();
    if (params?.locationId) queryParams.append("locationId", params.locationId);
    if (params?.productId) queryParams.append("productId", params.productId);

    const response = await apiClient.get<
      ApiResponse<{ stock: FinishedProductStock[] }>
    >(`${endpoints.stock.finishedProduct}?${queryParams}`);
    return (response.data as any).data.stock;
  },

  updateFinishedProductStock: async (
    productId: string,
    locationId: string,
    data: UpdateStockRequest
  ): Promise<FinishedProductStock> => {
    const response = await apiClient.put<
      ApiResponse<{ stock: FinishedProductStock }>
    >(endpoints.stock.updateFinishedProduct(productId, locationId), data);
    return (response.data as any).data.stock;
  },

  // Stock Overview (Manager only)
  getStockOverview: async (): Promise<StockOverview> => {
    const response = await apiClient.get<ApiResponse<StockOverview>>(
      endpoints.stock.overview
    );
    return (response.data as any).data;
  },
};
