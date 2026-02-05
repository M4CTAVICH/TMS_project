import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transportService } from "../api/services/transport.service";
import type {
  CreateVehicleRequest,
  CalculateTransportCostRequest,
  VehicleStatus,
  TransportJobStatus,
} from "../types/api.types";
import { toast } from "sonner";

export const useTransportProviders = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transport", "providers"],
    queryFn: transportService.getProviders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; userId: string }) =>
      transportService.createProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport", "providers"] });
      toast.success("Transport provider created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create provider");
    },
  });

  return {
    providers: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createProvider: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};

export const useTransportProvider = (id: string) => {
  return useQuery({
    queryKey: ["transport", "providers", id],
    queryFn: () => transportService.getProviderById(id),
    enabled: !!id,
  });
};

export const useVehicles = (params?: {
  providerId?: string;
  status?: VehicleStatus;
}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transport", "vehicles", params],
    queryFn: () => transportService.getVehicles(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleRequest) =>
      transportService.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport", "vehicles"] });
      toast.success("Vehicle created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create vehicle");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateVehicleRequest>;
    }) => transportService.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport", "vehicles"] });
      toast.success("Vehicle updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update vehicle");
    },
  });

  return {
    vehicles: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createVehicle: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateVehicle: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: ["transport", "vehicles", id],
    queryFn: () => transportService.getVehicleById(id),
    enabled: !!id,
  });
};

export const useTransportJobs = (params?: {
  providerId?: string;
  status?: TransportJobStatus;
}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transport", "jobs", params],
    queryFn: () => transportService.getJobs(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TransportJobStatus }) =>
      transportService.updateJobStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Transport job status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update job status");
    },
  });

  return {
    jobs: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateJobStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};

export const useTransportJob = (id: string) => {
  return useQuery({
    queryKey: ["transport", "jobs", id],
    queryFn: () => transportService.getJobById(id),
    enabled: !!id,
  });
};

export const useCalculateTransportCost = () => {
  const mutation = useMutation({
    mutationFn: (data: CalculateTransportCostRequest) =>
      transportService.calculateCost(data),
    onError: (error: any) => {
      toast.error(error.message || "Failed to calculate transport cost");
    },
  });

  return {
    calculateCost: mutation.mutate,
    calculateCostAsync: mutation.mutateAsync,
    isCalculating: mutation.isPending,
    cost: mutation.data,
    error: mutation.error,
  };
};
