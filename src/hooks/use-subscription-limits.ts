import { useMutation } from "@tanstack/react-query";
import { apiClient, useApiClient } from "@/lib/api-client";
import { useCurrentSubscription } from "./use-subscriptions";

export interface LimitCheckResult {
  canAdd: boolean;
  isNearLimit: boolean;
  needsUpgrade: boolean;
  currentUsage: number;
  limit: number;
  percentageUsed: number;
}

export const useSubscriptionLimitCheck = () => {
  const { data: subscription } = useCurrentSubscription();
  const checkLimitMutation = useMutation({
    mutationFn: ({
      limitType,
      currentCount,
    }: {
      limitType: string;
      currentCount: number;
    }) => apiClient.checkLimit(limitType, currentCount),
  });

  const checkLimit = async (
    limitType: "products" | "users" | "orders" | "warehouses",
    additionalCount: number = 1
  ): Promise<LimitCheckResult> => {
    if (!subscription) {
      return {
        canAdd: false,
        isNearLimit: false,
        needsUpgrade: true,
        currentUsage: 0,
        limit: 0,
        percentageUsed: 0,
      };
    }

    let currentUsage: number;
    let limit: number;

    switch (limitType) {
      case "products":
        currentUsage = subscription.currentProducts || 0;
        limit = subscription.maxProducts || 0;
        break;
      case "users":
        currentUsage = subscription.currentUsers || 0;
        limit = subscription.maxUsers || 0;
        break;
      case "orders":
        currentUsage = subscription.currentOrders || 0;
        limit = subscription.maxOrders || 0;
        break;
      case "warehouses":
        currentUsage = subscription.currentWarehouses || 0;
        limit = subscription.maxWarehouses || 0;
        break;
      default:
        throw new Error(`Unknown limit type: ${limitType}`);
    }

    const isUnlimited = limit >= 2147483647;
    if (isUnlimited) {
      return {
        canAdd: true,
        isNearLimit: false,
        needsUpgrade: false,
        currentUsage,
        limit,
        percentageUsed: 0,
      };
    }

    const newUsage = currentUsage + additionalCount;
    const percentageUsed = (currentUsage / limit) * 100;
    const newPercentageUsed = (newUsage / limit) * 100;

    const canAdd = newUsage <= limit;
    const isNearLimit = percentageUsed >= 80;
    const needsUpgrade = newPercentageUsed > 100;

    return {
      canAdd,
      isNearLimit,
      needsUpgrade,
      currentUsage,
      limit,
      percentageUsed,
    };
  };

  return {
    checkLimit,
    isLoading: checkLimitMutation.isPending,
    error: checkLimitMutation.error,
  };
};
