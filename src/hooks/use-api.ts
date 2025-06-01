import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  apiClient,
  useApiClient,
  type SyncUserRequest,
  type SyncOrganizationRequest,
  type CreateProductRequest,
  type ProductSearchRequest,
} from "@/lib/api-client";

// Query keys
export const queryKeys = {
  user: ["user"] as const,
  currentOrganization: ["organization", "current"] as const,
  products: (params?: ProductSearchRequest) => ["products", params] as const,
  product: (id: string) => ["product", id] as const,
  ping: ["ping"] as const,
  authTest: ["auth-test"] as const,
};

// Test hooks
export const usePing = () => {
  useApiClient();
  return useQuery({
    queryKey: queryKeys.ping,
    queryFn: () => apiClient.ping(),
  });
};

export const useAuthTest = () => {
  const { isSignedIn } = useAuth();
  useApiClient();

  return useQuery({
    queryKey: queryKeys.authTest,
    queryFn: () => apiClient.authTest(),
    enabled: isSignedIn,
  });
};

// User hooks
export const useSyncUser = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (data: SyncUserRequest) => apiClient.syncUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
};

export const useCurrentUser = () => {
  const { isSignedIn } = useAuth();
  useApiClient();

  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isSignedIn,
    retry: false, // Don't retry if user doesn't exist yet
  });
};

// Organization hooks
export const useSyncOrganization = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (data: SyncOrganizationRequest) =>
      apiClient.syncOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.currentOrganization,
      });
    },
  });
};

export const useCurrentOrganization = () => {
  const { isSignedIn } = useAuth();
  useApiClient();

  return useQuery({
    queryKey: queryKeys.currentOrganization,
    queryFn: () => apiClient.getCurrentOrganization(),
    enabled: isSignedIn,
    retry: false,
  });
};

// Product hooks
export const useProducts = (params?: ProductSearchRequest) => {
  const { isSignedIn } = useAuth();
  useApiClient();

  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => apiClient.getProducts(params),
    enabled: isSignedIn,
  });
};

export const useProduct = (id: string) => {
  const { isSignedIn } = useAuth();
  useApiClient();

  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => apiClient.getProduct(id),
    enabled: isSignedIn && !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductRequest>;
    }) => apiClient.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useCheckSkuAvailability = () => {
  useApiClient();

  return useMutation({
    mutationFn: ({ sku, excludeId }: { sku: string; excludeId?: string }) =>
      apiClient.checkSkuAvailability(sku, excludeId),
  });
};
