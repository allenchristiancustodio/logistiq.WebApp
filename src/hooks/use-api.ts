import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import {
  apiClient,
  useApiClient,
  type SyncUserRequest,
  type SyncOrganizationRequest,
  type CreateProductRequest,
  type ProductSearchRequest,
  type UpdateUserProfileRequest,
  type UpdateOrganizationRequest,
  type CompleteUserOnboardingRequest,
  type CompleteOrganizationSetupRequest,
  type UpdateCategoryRequest,
  type CreateCategoryRequest,
  type CategorySearchRequest,
} from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

// Query keys now include organization ID for proper cache isolation
export const queryKeys = {
  user: ["user"] as const,
  currentOrganization: (orgId?: string) =>
    ["organization", "current", orgId] as const,
  products: (orgId?: string, params?: ProductSearchRequest) =>
    ["products", orgId, params] as const,
  product: (orgId?: string, id?: string) => ["product", orgId, id] as const,
  ping: ["ping"] as const,
  authTest: ["auth-test"] as const,
};

// Helper hook to get current organization ID
const useCurrentOrgId = () => {
  const { organization } = useOrganization();
  return organization?.id;
};

// Test hooks (unchanged)
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

export const useCompleteUserOnboarding = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (data: CompleteUserOnboardingRequest) =>
      apiClient.completeUserOnboarding(data),
    onSuccess: (user) => {
      const { setUser } = useAuthStore.getState();
      setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      apiClient.updateUserProfile(data),
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
    retry: false,
  });
};

// Organization hooks with cache isolation
export const useSyncOrganization = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: SyncOrganizationRequest) =>
      apiClient.syncOrganization(data),
    onSuccess: () => {
      // Invalidate for current organization
      queryClient.invalidateQueries({
        queryKey: queryKeys.currentOrganization(orgId),
      });
    },
  });
};

export const useCompleteOrganizationSetup = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: CompleteOrganizationSetupRequest) =>
      apiClient.completeOrganizationSetup(data),
    onSuccess: (organization) => {
      const { setOrganization } = useAuthStore.getState();
      setOrganization(organization);

      queryClient.invalidateQueries({
        queryKey: queryKeys.currentOrganization(orgId),
      });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) =>
      apiClient.updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.currentOrganization(orgId),
      });
    },
  });
};

export const useCurrentOrganization = () => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: queryKeys.currentOrganization(orgId),
    queryFn: () => apiClient.getCurrentOrganization(),
    enabled: isSignedIn && !!orgId,
    retry: false,
  });
};

// Product hooks with organization-specific caching
export const useProducts = (params?: ProductSearchRequest) => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: queryKeys.products(orgId, params),
    queryFn: () => apiClient.getProducts(params),
    enabled: isSignedIn && !!orgId,
  });
};

export const useProduct = (id: string) => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: queryKeys.product(orgId, id),
    queryFn: () => apiClient.getProduct(id),
    enabled: isSignedIn && !!id && !!orgId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => apiClient.createProduct(data),
    onSuccess: () => {
      // Invalidate products for current organization only
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
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductRequest>;
    }) => apiClient.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["products", orgId],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.product(orgId, id),
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

export const categoryQueryKeys = {
  categories: (orgId?: string, params?: CategorySearchRequest) =>
    ["categories", orgId, params] as const,
  category: (orgId?: string, id?: string) => ["category", orgId, id] as const,
  categoryHierarchy: (orgId?: string) =>
    ["categories", "hierarchy", orgId] as const,
};

// Category hooks with organization-specific caching
export const useCategories = () => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: ["categories", orgId],
    queryFn: () => apiClient.getCategories(),
    enabled: isSignedIn && !!orgId,
    retry: false,
  });
};

export const useCategory = (id: string) => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: categoryQueryKeys.category(orgId, id),
    queryFn: () => apiClient.getCategory(id),
    enabled: isSignedIn && !!id && !!orgId,
  });
};

export const useCategoryHierarchy = () => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: categoryQueryKeys.categoryHierarchy(orgId),
    queryFn: () => apiClient.getCategoryHierarchy(),
    enabled: isSignedIn && !!orgId,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => apiClient.createCategory(data),
    onSuccess: () => {
      // Invalidate categories for current organization only
      queryClient.invalidateQueries({
        queryKey: ["categories", orgId],
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      apiClient.updateCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", orgId],
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.category(orgId, id),
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories", orgId],
      });
      // Also invalidate products since category deletion affects them
      queryClient.invalidateQueries({
        queryKey: ["products", orgId],
      });
    },
  });
};

// Utility hook to clear all organization-specific cache when switching orgs
export const useClearOrganizationCache = () => {
  const queryClient = useQueryClient();

  return () => {
    // Clear all organization-specific queries
    queryClient.removeQueries({ queryKey: ["products"] });
    queryClient.removeQueries({ queryKey: ["organization"] });
    queryClient.removeQueries({ queryKey: ["orders"] });
    queryClient.removeQueries({ queryKey: ["customers"] });
    queryClient.removeQueries({ queryKey: ["categories"] });
    // Add more as you build features

    console.log("🧹 Cleared organization-specific cache");
  };
};
