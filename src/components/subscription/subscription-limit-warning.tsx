import { AlertTriangle, Crown, ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  useSubscriptionUsage,
  useSubscriptionFeatures,
} from "../../hooks/use-api";
import { useNavigate } from "react-router-dom";
import React from "react";

interface SubscriptionLimitWarningProps {
  limitType: "users" | "products" | "orders" | "warehouses";
  className?: string;
}

export function SubscriptionLimitWarning({
  limitType,
  className,
}: SubscriptionLimitWarningProps) {
  const { data: usage } = useSubscriptionUsage();
  const features = useSubscriptionFeatures();
  const navigate = useNavigate();

  if (!usage?.usageMetrics) return null;

  const metric =
    usage.usageMetrics[limitType.charAt(0).toUpperCase() + limitType.slice(1)];

  if (!metric || (!metric.isNearLimit && !metric.isAtLimit)) return null;

  const getLimitTypeDisplayName = (type: string) => {
    switch (type) {
      case "users":
        return "team members";
      case "products":
        return "products";
      case "orders":
        return "orders this month";
      case "warehouses":
        return "warehouses";
      default:
        return type;
    }
  };

  const getUpgradeMessage = () => {
    if (metric.isAtLimit) {
      return `You've reached your limit of ${
        metric.limit
      } ${getLimitTypeDisplayName(limitType)}. Upgrade your plan to add more.`;
    }
    return `You're using ${metric.current} of ${
      metric.limit
    } ${getLimitTypeDisplayName(limitType)} (${Math.round(
      metric.percentageUsed
    )}%). Consider upgrading soon.`;
  };

  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-lg text-orange-900">
            {metric.isAtLimit ? "Limit Reached" : "Approaching Limit"}
          </CardTitle>
          <Badge variant="outline" className="ml-auto">
            {features.planName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-orange-700">
          {getUpgradeMessage()}
        </CardDescription>

        <div className="flex gap-3">
          <Button
            size="sm"
            onClick={() => navigate("/subscription")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/subscription?tab=usage")}
          >
            View Usage
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to check if we should show limit warning for a specific action
export function useSubscriptionLimitCheck() {
  const { data: usage } = useSubscriptionUsage();
  const features = useSubscriptionFeatures();

  const checkLimit = (
    limitType: "users" | "products" | "orders" | "warehouses"
  ) => {
    if (!usage?.usageMetrics) return { canAdd: true, needsUpgrade: false };

    const metric =
      usage.usageMetrics[
        limitType.charAt(0).toUpperCase() + limitType.slice(1)
      ];
    if (!metric) return { canAdd: true, needsUpgrade: false };

    return {
      canAdd: !metric.isAtLimit,
      needsUpgrade: metric.isAtLimit,
      isNearLimit: metric.isNearLimit,
      current: metric.current,
      limit: metric.limit,
      percentageUsed: metric.percentageUsed,
    };
  };

  return {
    checkLimit,
    isTrialActive: features.isTrialActive,
    planName: features.planName,
    hasReporting: features.hasReporting,
    hasAdvancedReporting: features.hasAdvancedReporting,
    hasInvoicing: features.hasInvoicing,
  };
}
