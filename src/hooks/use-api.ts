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
  type CreateTrialSubscriptionRequest,
  type CreatePaidSubscriptionRequest,
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

// Subscription query keys
export const subscriptionQueryKeys = {
  subscription: (orgId?: string) => ["subscription", orgId] as const,
  plans: ["subscription", "plans"] as const,
  limits: (orgId?: string) => ["subscription", "limits", orgId] as const,
  usage: (orgId?: string) => ["subscription", "usage", orgId] as const,
};

// Subscription hooks
export const useCurrentSubscription = () => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: subscriptionQueryKeys.subscription(orgId),
    queryFn: () => apiClient.getCurrentSubscription(),
    enabled: isSignedIn && !!orgId,
    retry: false,
  });
};

export const useAvailablePlans = () => {
  useApiClient();

  return useQuery({
    queryKey: subscriptionQueryKeys.plans,
    queryFn: () => apiClient.getAvailablePlans(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSubscriptionLimits = () => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: subscriptionQueryKeys.limits(orgId),
    queryFn: () => apiClient.getSubscriptionLimits(),
    enabled: isSignedIn && !!orgId,
    retry: false,
  });
};

export const useSubscriptionUsage = () => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: subscriptionQueryKeys.usage(orgId),
    queryFn: () => apiClient.getSubscriptionUsage(),
    enabled: isSignedIn && !!orgId,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

export const useCreateTrialSubscription = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: CreateTrialSubscriptionRequest) =>
      apiClient.createTrialSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.subscription(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.limits(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.usage(orgId),
      });
    },
  });
};

export const useCreatePaidSubscription = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: CreatePaidSubscriptionRequest) =>
      apiClient.createPaidSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.subscription(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.limits(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.usage(orgId),
      });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof apiClient.updateSubscription>[1];
    }) => apiClient.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.subscription(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.limits(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.usage(orgId),
      });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { cancellationReason?: string; cancelImmediately?: boolean };
    }) => apiClient.cancelSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.subscription(orgId),
      });
    },
  });
};

export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.reactivateSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.subscription(orgId),
      });
    },
  });
};

export const useCheckSubscriptionLimit = () => {
  useApiClient();

  return useMutation({
    mutationFn: ({
      limitType,
      currentCount,
    }: {
      limitType: string;
      currentCount: number;
    }) => apiClient.checkLimit(limitType, currentCount),
  });
};

export const useSubscriptionFeatures = () => {
  const { data: subscription } = useCurrentSubscription();

  return {
    hasReporting: subscription?.hasReporting ?? false,
    hasAdvancedReporting: subscription?.hasAdvancedReporting ?? false,
    hasInvoicing: subscription?.hasInvoicing ?? false,
    isTrialActive: subscription?.isTrialActive ?? false,
    daysRemaining: subscription?.daysRemaining ?? 0,
    isExpired: subscription?.isExpired ?? false,
    planName: subscription?.planName ?? "Trial",
    canAddUsers:
      (subscription?.currentUsers ?? 0) < (subscription?.maxUsers ?? 0),
    canAddProducts:
      (subscription?.currentProducts ?? 0) < (subscription?.maxProducts ?? 0),
    canAddOrders:
      (subscription?.currentOrders ?? 0) < (subscription?.maxOrders ?? 0),
    canAddWarehouses:
      (subscription?.currentWarehouses ?? 0) <
      (subscription?.maxWarehouses ?? 0),
  };
};

export const useStripePrices = () => {
  useApiClient();

  return useQuery({
    queryKey: ["stripe", "prices"],
    queryFn: () => apiClient.getStripePrices(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCreateCheckoutSession = () => {
  useApiClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.createCheckoutSession>[0]) =>
      apiClient.createCheckoutSession(data),
  });
};

export const useCreatePortalSession = () => {
  useApiClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.createPortalSession>[0]) =>
      apiClient.createPortalSession(data),
  });
};

export const useCreateStripeCustomer = () => {
  useApiClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof apiClient.createStripeCustomer>[0]) =>
      apiClient.createStripeCustomer(data),
  });
};

export const useStripeSubscription = (subscriptionId?: string) => {
  const { isSignedIn } = useAuth();
  useApiClient();

  return useQuery({
    queryKey: ["stripe", "subscription", subscriptionId],
    queryFn: () => apiClient.getStripeSubscription(subscriptionId!),
    enabled: isSignedIn && !!subscriptionId,
  });
};

export const useCancelStripeSubscription = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      immediately,
    }: {
      subscriptionId: string;
      immediately?: boolean;
    }) => apiClient.cancelStripeSubscription(subscriptionId, immediately),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["stripe", "subscription", variables.subscriptionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
      });
    },
  });
};

export const useUpdateStripeSubscription = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      data,
    }: {
      subscriptionId: string;
      data: Parameters<typeof apiClient.updateStripeSubscription>[1];
    }) => apiClient.updateStripeSubscription(subscriptionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["stripe", "subscription", variables.subscriptionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["subscription"],
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
