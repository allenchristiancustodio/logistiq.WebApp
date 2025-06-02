// src/components/subscription/subscription-dashboard-widget.tsx
import { Crown, AlertTriangle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentSubscription } from "@/hooks/use-api";
import { useNavigate } from "react-router-dom";

export function SubscriptionDashboardWidget() {
  const { data: subscription, isLoading } = useCurrentSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-5 h-5" />
            No Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700 mb-3">
            You don't have an active subscription. Start your free trial to
            access all features.
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/subscription")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Start Free Trial
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string | undefined | null) => {
    if (!status || typeof status !== "string") {
      return "secondary";
    }

    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "trial":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "pastdue":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isTrialEndingSoon =
    subscription.isTrialActive && subscription.daysRemaining <= 7;
  const isExpired = subscription.isExpired;

  return (
    <Card
      className={`${
        isTrialEndingSoon || isExpired ? "border-orange-200 bg-orange-50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            {subscription.planName} Plan
          </CardTitle>
          <Badge variant={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Monthly Price</p>
            <p className="font-semibold">
              {subscription.isTrialActive
                ? "Free"
                : formatCurrency(subscription.monthlyPrice)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              {subscription.isTrialActive ? "Trial Ends" : "Next Billing"}
            </p>
            <p className="font-semibold flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {subscription.daysRemaining} days
            </p>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Products</p>
            <p className="font-medium">
              {subscription.currentProducts} /{" "}
              {subscription.maxProducts === 2147483647
                ? "∞"
                : subscription.maxProducts}
            </p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600">Users</p>
            <p className="font-medium">
              {subscription.currentUsers} /{" "}
              {subscription.maxUsers === 2147483647
                ? "∞"
                : subscription.maxUsers}
            </p>
          </div>
        </div>

        {/* Warning Messages */}
        {isTrialEndingSoon && (
          <div className="bg-orange-100 border border-orange-200 rounded p-3">
            <p className="text-sm text-orange-800">
              Trial expires in {subscription.daysRemaining} days
            </p>
          </div>
        )}

        {isExpired && (
          <div className="bg-red-100 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">
              Your subscription has expired
            </p>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/subscription")}
          className="w-full"
        >
          {subscription.isTrialActive ? "Upgrade Plan" : "Manage Subscription"}
        </Button>
      </CardContent>
    </Card>
  );
}
