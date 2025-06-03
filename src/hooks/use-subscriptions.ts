import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import {
  apiClient,
  useApiClient,
  type CreateTrialSubscriptionRequest,
  type CreatePaidSubscriptionRequest,
} from "@/lib/api-client";
import { useCurrentOrgId } from "./use-auth-api";

// Query keys for subscription-related queries
export const subscriptionQueryKeys = {
  subscription: (orgId?: string) => ["subscription", orgId] as const,
  plans: ["plans"] as const,
  limits: (orgId?: string) => ["subscription-limits", orgId] as const,
  usage: (orgId?: string) => ["subscription-usage", orgId] as const,
  features: (orgId?: string) => ["subscription-features", orgId] as const,
  stripePrices: ["stripe-prices"] as const,
  stripeSubscription: (orgId?: string, subscriptionId?: string) =>
    ["stripe-subscription", orgId, subscriptionId] as const,
};

// Subscription query hooks
export const useCurrentSubscription = () => {
  const { isSignedIn } = useClerkAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: subscriptionQueryKeys.subscription(orgId),
    queryFn: () => apiClient.getCurrentSubscription(),
    enabled: isSignedIn && !!orgId,
  });
};

export const useAvailablePlans = () => {
  useApiClient();
  return useQuery({
    queryKey: subscriptionQueryKeys.plans,
    queryFn: () => apiClient.getAvailablePlans(),
  });
};

export const useSubscriptionLimits = () => {
  const { isSignedIn } = useClerkAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: subscriptionQueryKeys.limits(orgId),
    queryFn: () => apiClient.getSubscriptionLimits(),
    enabled: isSignedIn && !!orgId,
  });
};

export const useSubscriptionUsage = () => {
  const { isSignedIn } = useClerkAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: subscriptionQueryKeys.usage(orgId),
    queryFn: () => apiClient.getSubscriptionUsage(),
    enabled: isSignedIn && !!orgId,
  });
};

export const useSubscriptionFeatures = () => {
  const { data: subscription } = useCurrentSubscription();

  return {
    hasReporting: subscription?.hasReporting ?? false,
    hasAdvancedReporting: subscription?.hasAdvancedReporting ?? false,
    hasInvoicing: subscription?.hasInvoicing ?? false,
    maxUsers: subscription?.maxUsers ?? 0,
    maxProducts: subscription?.maxProducts ?? 0,
    maxOrders: subscription?.maxOrders ?? 0,
    maxWarehouses: subscription?.maxWarehouses ?? 0,
  };
};

// Subscription mutation hooks
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
      data: Partial<CreatePaidSubscriptionRequest>;
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
      data: { cancelImmediately: boolean };
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

// Stripe-related hooks
export const useStripePrices = () => {
  useApiClient();
  return useQuery({
    queryKey: subscriptionQueryKeys.stripePrices,
    queryFn: () => apiClient.getStripePrices(),
  });
};

export const useCreateCheckoutSession = () => {
  useApiClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createCheckoutSession(data),
  });
};

export const useCreatePortalSession = () => {
  useApiClient();
  return useMutation({
    mutationFn: (data: { customerId: string; returnUrl: string }) => apiClient.createPortalSession(data),
  });
};

export const useCreateStripeCustomer = () => {
  useApiClient();
  return useMutation({
    mutationFn: (data: any) => apiClient.createStripeCustomer(data),
  });
};

export const useStripeSubscription = (subscriptionId?: string) => {
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: subscriptionQueryKeys.stripeSubscription(orgId, subscriptionId),
    queryFn: () => apiClient.getStripeSubscription(subscriptionId!),
    enabled: !!subscriptionId,
  });
};

export const useCancelStripeSubscription = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (subscriptionId: string) =>
      apiClient.cancelStripeSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.subscription(orgId),
      });
    },
  });
};

export const useUpdateStripeSubscription = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      data,
    }: {
      subscriptionId: string;
      data: any;
    }) => apiClient.updateStripeSubscription(subscriptionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.subscription(orgId),
      });
    },
  });
};

// Plan management hooks
export const useChangePlan = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: {
      newPlanId: string;
      effectiveDate?: string;
      prorationBehavior?: string;
    }) => apiClient.changePlan(data),
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

export const useUpgradeToProPlan = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (isAnnual: boolean = false) =>
      apiClient.upgradeToProPlan(isAnnual),
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

export const useDowngradeToStarter = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: () => apiClient.downgradeToStarter(),
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

export const useCanChangeToPlan = () => {
  useApiClient();
  return useMutation({
    mutationFn: (planId: string) => apiClient.canChangeToPlan(planId),
  });
};

export const useUpgradeRecommendations = () => {
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: ["upgrade-recommendations", orgId],
    queryFn: () => apiClient.getUpgradeRecommendations(),
    enabled: !!orgId,
  });
};
