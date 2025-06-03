// src/pages/subscription.tsx
import { useState } from "react";
import {
  CreditCard,
  Crown,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  Warehouse,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCurrentSubscription,
  useAvailablePlans,
  useSubscriptionUsage,
  useCancelSubscription,
  useSubscriptionFeatures,
} from "@/hooks/use-api";
import { StripeCheckout } from "@/components/billing/stripe-checkout";
import { toast } from "sonner";

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useCurrentSubscription();

  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useAvailablePlans();

  const { data: usage, isLoading: usageLoading } = useSubscriptionUsage();

  const features = useSubscriptionFeatures();
  const cancelSubscriptionMutation = useCancelSubscription();

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowCheckout(true);
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      await cancelSubscriptionMutation.mutateAsync({
        id: subscription.id,
        data: { cancelImmediately: false },
      });
      toast.success(
        "Subscription cancelled. You can continue using your current plan until the end of your billing period."
      );
      setIsCancelModalOpen(false);
    } catch (error: any) {
      toast.error("Failed to cancel subscription");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string | number | undefined | null) => {
    if (!status) return "secondary";

    // Handle both string and enum (number) status
    const statusStr =
      typeof status === "number"
        ? getStatusString(status)
        : status.toString().toLowerCase();

    switch (statusStr.toLowerCase()) {
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

  const getStatusString = (status: string | number | undefined | null) => {
    if (!status) return "Unknown";

    // Handle enum values from backend
    if (typeof status === "number") {
      switch (status) {
        case 0:
          return "Trial";
        case 1:
          return "Active";
        case 2:
          return "Cancelled";
        case 3:
          return "PastDue";
        default:
          return "Unknown";
      }
    }

    return status.toString();
  };

  const getStatusIcon = (status: string | number | undefined | null) => {
    const statusStr = getStatusString(status).toLowerCase();

    switch (statusStr) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "trial":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const isPaidSubscription =
    subscription?.stripeSubscriptionId && !subscription?.isTrialActive;
  const isActiveTrial =
    subscription?.isTrialActive && subscription?.daysRemaining > 0;

  // Handle backend inconsistency: if we have Stripe IDs, it's a paid subscription
  const hasStripeSubscription = !!subscription?.stripeSubscriptionId;
  const isReallyTrial =
    subscription?.isTrialActive && !subscription?.stripeSubscriptionId;

  if (subscriptionLoading || plansLoading) {
    return <LoadingScreen message="Loading subscription details..." />;
  }

  if (subscriptionError || plansError) {
    return (
      <PageWrapper
        title="Subscription"
        description="Manage your Logistiq subscription"
      >
        <ErrorMessage
          title="Failed to load subscription information"
          message="There was an error loading your subscription details."
          onRetry={() => refetchSubscription()}
        />
      </PageWrapper>
    );
  }

  if (showCheckout) {
    return (
      <PageWrapper title="Upgrade Subscription" description="Choose your plan">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setShowCheckout(false)}
            className="mb-6"
          >
            ← Back to Subscription
          </Button>
          <StripeCheckout
            defaultPlan={selectedPlan || "professional"}
            onSuccess={() => {
              setShowCheckout(false);
              toast.success("Subscription upgraded successfully!");
              refetchSubscription();
            }}
            onCancel={() => {
              setShowCheckout(false);
              toast.info("Upgrade cancelled");
            }}
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Subscription & Billing"
      description="Manage your Logistiq subscription and usage"
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Current Plan: {subscription?.planName || "No Plan"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    {getStatusIcon(subscription?.status)}
                    {isReallyTrial && (
                      <span>
                        Trial expires in {subscription.daysRemaining} days
                      </span>
                    )}
                    {hasStripeSubscription && (
                      <span>Billing cycle: Monthly</span>
                    )}
                    {!subscription && <span>No active subscription</span>}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(subscription?.status)}>
                  {getStatusString(subscription?.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(subscription?.monthlyPrice || 0)}
                  </div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {subscription?.daysRemaining || 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isReallyTrial
                      ? "trial days left"
                      : hasStripeSubscription
                      ? "days until next billing"
                      : "days in cycle"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {subscription?.currentUsers || 0}
                  </div>
                  <div className="text-sm text-gray-500">active users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {subscription?.currentProducts || 0}
                  </div>
                  <div className="text-sm text-gray-500">products</div>
                </div>
              </div>

              {/* Trial Warning */}
              {isReallyTrial && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">
                        Trial Active
                      </h4>
                      <p className="text-sm text-blue-700">
                        Your trial expires on{" "}
                        {subscription?.trialEndDate
                          ? new Date(
                              subscription.trialEndDate
                            ).toLocaleDateString()
                          : "unknown date"}
                        . Upgrade now to continue using Logistiq without
                        interruption.
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => handleUpgrade("professional")}
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Paid Subscription Info */}
              {hasStripeSubscription && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">
                        Subscription Active
                      </h4>
                      <p className="text-sm text-green-700">
                        Your {subscription.planName} subscription is active.
                        {subscription.stripeCustomerId && (
                          <span> Billing managed through Stripe.</span>
                        )}
                        {subscription?.isTrialActive && (
                          <span className="block text-orange-600 mt-1">
                            Note: Your trial period is still active. This will
                            automatically end when your trial expires.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {hasStripeSubscription && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                    <Button onClick={() => handleUpgrade("enterprise")}>
                      Upgrade Plan
                    </Button>
                  </>
                )}
                {isReallyTrial && (
                  <Button onClick={() => handleUpgrade("professional")}>
                    Upgrade to Professional
                  </Button>
                )}
                {!subscription && (
                  <Button onClick={() => handleUpgrade("professional")}>
                    Start Your Free Trial
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscription?.currentUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of{" "}
                  {subscription?.maxUsers === 2147483647
                    ? "∞"
                    : subscription?.maxUsers || 0}{" "}
                  allowed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscription?.currentProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of{" "}
                  {subscription?.maxProducts === 2147483647
                    ? "∞"
                    : subscription?.maxProducts || 0}{" "}
                  allowed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscription?.currentOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of{" "}
                  {subscription?.maxOrders === 2147483647
                    ? "∞"
                    : subscription?.maxOrders || 0}{" "}
                  this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Warehouses
                </CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscription?.currentWarehouses || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of{" "}
                  {subscription?.maxWarehouses === 2147483647
                    ? "∞"
                    : subscription?.maxWarehouses || 0}{" "}
                  allowed
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Usage Overview
              </CardTitle>
              <CardDescription>
                Track your current usage against subscription limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {usage?.usageMetrics &&
                Object.entries(usage.usageMetrics).map(([key, metric]) => {
                  const isUnlimited = metric.limit === 2147483647;
                  const percentage = isUnlimited
                    ? 0
                    : Math.min(metric.percentageUsed, 100);

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{key}</div>
                        <div className="text-sm text-gray-500">
                          {metric.current} / {isUnlimited ? "∞" : metric.limit}
                        </div>
                      </div>
                      {!isUnlimited && (
                        <>
                          <Progress
                            value={percentage}
                            className={`h-2 ${
                              metric.isNearLimit
                                ? "bg-orange-100"
                                : metric.isAtLimit
                                ? "bg-red-100"
                                : ""
                            }`}
                          />
                          {metric.isNearLimit && !metric.isAtLimit && (
                            <p className="text-xs text-orange-600">
                              You're approaching your {key.toLowerCase()} limit
                            </p>
                          )}
                          {metric.isAtLimit && (
                            <p className="text-xs text-red-600">
                              You've reached your {key.toLowerCase()} limit.
                              Upgrade to add more.
                            </p>
                          )}
                        </>
                      )}
                      {isUnlimited && (
                        <p className="text-xs text-green-600">
                          Unlimited {key.toLowerCase()} with your current plan
                        </p>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {/* Feature Access */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Access</CardTitle>
              <CardDescription>
                Features available with your current plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Basic Reporting</span>
                  <Badge
                    variant={features.hasReporting ? "default" : "secondary"}
                  >
                    {features.hasReporting ? "Included" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Advanced Reporting</span>
                  <Badge
                    variant={
                      features.hasAdvancedReporting ? "default" : "secondary"
                    }
                  >
                    {features.hasAdvancedReporting
                      ? "Included"
                      : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Invoicing</span>
                  <Badge
                    variant={features.hasInvoicing ? "default" : "secondary"}
                  >
                    {features.hasInvoicing ? "Included" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>API Access</span>
                  <Badge variant="default">Included</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">
              Scale your inventory management as your business grows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => {
              const isCurrentPlan =
                plan.id === subscription?.planName?.toLowerCase();
              const isUpgrade =
                plan.monthlyPrice > (subscription?.monthlyPrice || 0);

              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.isPopular ? "border-blue-500 border-2" : ""
                  } ${isCurrentPlan ? "bg-blue-50 border-blue-300" : ""}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500">Most Popular</Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {formatCurrency(plan.monthlyPrice)}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                      {plan.annualPrice > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          Save{" "}
                          {formatCurrency(
                            plan.monthlyPrice * 12 - plan.annualPrice
                          )}{" "}
                          annually
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-2 text-xs text-gray-500 border-t pt-4">
                      <div>
                        Up to{" "}
                        {plan.maxUsers === 2147483647
                          ? "unlimited"
                          : plan.maxUsers}{" "}
                        users
                      </div>
                      <div>
                        Up to{" "}
                        {plan.maxProducts === 2147483647
                          ? "unlimited"
                          : plan.maxProducts.toLocaleString()}{" "}
                        products
                      </div>
                      <div>
                        Up to{" "}
                        {plan.maxOrders === 2147483647
                          ? "unlimited"
                          : plan.maxOrders.toLocaleString()}{" "}
                        orders/month
                      </div>
                      <div>
                        Up to{" "}
                        {plan.maxWarehouses === 2147483647
                          ? "unlimited"
                          : plan.maxWarehouses}{" "}
                        warehouses
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "outline" : "default"}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : isActiveTrial
                        ? "Start Free Trial"
                        : isUpgrade
                        ? "Upgrade"
                        : "Downgrade"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Subscription Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll continue
              to have access until the end of your current billing period
              {subscription?.endDate && (
                <span>
                  {" "}
                  ({new Date(subscription.endDate).toLocaleDateString()})
                </span>
              )}
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
            >
              {cancelSubscriptionMutation.isPending
                ? "Cancelling..."
                : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
