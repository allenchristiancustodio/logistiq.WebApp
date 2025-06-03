import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import {
  apiClient,
  useApiClient,
  type CreateProductRequest,
  type ProductSearchRequest,
} from "@/lib/api-client";
import { useCurrentOrgId } from "./use-auth-api";

// Query keys for product-related queries
export const productQueryKeys = {
  products: (orgId?: string, params?: ProductSearchRequest) =>
    ["products", orgId, params] as const,
  product: (orgId?: string, id?: string) => ["product", orgId, id] as const,
  skuAvailability: (orgId?: string, sku?: string) =>
    ["sku-availability", orgId, sku] as const,
};

// Product query hooks
export const useProducts = (params?: ProductSearchRequest) => {
  const { isSignedIn } = useClerkAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: productQueryKeys.products(orgId, params),
    queryFn: () => apiClient.getProducts(params),
    enabled: isSignedIn && !!orgId,
  });
};

export const useProduct = (id: string) => {
  const { isSignedIn } = useClerkAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: productQueryKeys.product(orgId, id),
    queryFn: () => apiClient.getProduct(id),
    enabled: isSignedIn && !!id && !!orgId,
  });
};

// Product mutation hooks
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", orgId],
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateProductRequest }) =>
      apiClient.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", orgId],
      });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.product(orgId, variables.id),
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", orgId],
      });
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
