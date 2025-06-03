import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useCurrentSubscription,
  useSubscriptionUsage,
  useAvailablePlans,
  useCreateTrialSubscription,
  useCreateCheckoutSession,
  useStripePrices,
} from "@/hooks/use-api";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { Crown, CreditCard, Package, Users } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionDebug() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isCreatingTrial, setIsCreatingTrial] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  // API hooks
  const {
    data: subscription,
    isLoading: subLoading,
    error: subError,
    refetch: refetchSub,
  } = useCurrentSubscription();
  const {
    data: usage,
    isLoading: usageLoading,
    error: usageError,
  } = useSubscriptionUsage();
  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useAvailablePlans();
  const {
    data: prices,
    isLoading: pricesLoading,
    error: pricesError,
  } = useStripePrices();

  const createTrialMutation = useCreateTrialSubscription();
  const createCheckoutMutation = useCreateCheckoutSession();

  const handleCreateTrial = async () => {
    if (!organization) {
      toast.error("No organization found");
      return;
    }

    setIsCreatingTrial(true);
    try {
      await createTrialMutation.mutateAsync({
        planName: "Trial",
        trialDays: 14,
      });
      toast.success("Trial subscription created!");
      refetchSub();
    } catch (error: any) {
      toast.error(error.message || "Failed to create trial");
    } finally {
      setIsCreatingTrial(false);
    }
  };

  const handleCreateCheckout = async () => {
    if (!user || !organization) {
      toast.error("User or organization not found");
      return;
    }

    // Find a professional plan price
    const professionalPrice = prices?.find(
      (p) =>
        p.productName.toLowerCase().includes("professional") &&
        p.interval === "month"
    );

    if (!professionalPrice) {
      toast.error("No professional plan price found");
      return;
    }

    setIsCreatingCheckout(true);
    try {
      const result = await createCheckoutMutation.mutateAsync({
        priceId: professionalPrice.id,
        customerEmail: user.emailAddresses[0]?.emailAddress || "",
        customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        organizationName: organization.name,
        successUrl: `${window.location.origin}/subscription?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        isAnnual: false,
        trialDays: 14,
      });

      // Redirect to Stripe Checkout
      window.location.href = result.sessionUrl;
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (subLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">Loading subscription data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Subscription Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User & Organization Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">👤 User Info</h4>
              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <div>
                  <strong>ID:</strong> {user?.id}
                </div>
                <div>
                  <strong>Email:</strong>{" "}
                  {user?.emailAddresses[0]?.emailAddress}
                </div>
                <div>
                  <strong>Name:</strong> {user?.fullName}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🏢 Organization Info</h4>
              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                {organization ? (
                  <>
                    <div>
                      <strong>ID:</strong> {organization.id}
                    </div>
                    <div>
                      <strong>Name:</strong> {organization.name}
                    </div>
                    <div>
                      <strong>Slug:</strong> {organization.slug}
                    </div>
                  </>
                ) : (
                  <div className="text-red-600">No organization found</div>
                )}
              </div>
            </div>
          </div>

          {/* Current Subscription */}
          <div>
            <h4 className="font-semibold mb-2">📋 Current Subscription</h4>
            {subscription ? (
              <div className="bg-blue-50 p-4 rounded space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      subscription.status === "Active" ? "default" : "secondary"
                    }
                  >
                    {subscription.status}
                  </Badge>
                  <span className="font-medium">{subscription.planName}</span>
                  {subscription.isTrialActive && (
                    <Badge variant="outline">Trial Active</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Price:</strong> ${subscription.monthlyPrice}/month
                  </div>
                  <div>
                    <strong>Days Remaining:</strong>{" "}
                    {subscription.daysRemaining}
                  </div>
                  <div>
                    <strong>Max Users:</strong> {subscription.maxUsers}
                  </div>
                  <div>
                    <strong>Max Products:</strong> {subscription.maxProducts}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Stripe Customer ID:</strong>{" "}
                  {subscription.stripeCustomerId || "None"}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-600 mb-3">No subscription found</p>
                <Button
                  onClick={handleCreateTrial}
                  disabled={isCreatingTrial}
                  size="sm"
                >
                  {isCreatingTrial
                    ? "Creating..."
                    : "Create Trial Subscription"}
                </Button>
              </div>
            )}
          </div>

          {/* Usage Stats */}
          {usage && (
            <div>
              <h4 className="font-semibold mb-2">📊 Usage Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <div className="text-lg font-bold">{usage.currentUsers}</div>
                  <div className="text-xs text-gray-600">Users</div>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <Package className="w-6 h-6 mx-auto mb-1 text-green-500" />
                  <div className="text-lg font-bold">
                    {usage.currentProducts}
                  </div>
                  <div className="text-xs text-gray-600">Products</div>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <div className="text-lg font-bold">{usage.currentOrders}</div>
                  <div className="text-xs text-gray-600">Orders</div>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <div className="text-lg font-bold">
                    {usage.currentWarehouses}
                  </div>
                  <div className="text-xs text-gray-600">Warehouses</div>
                </div>
              </div>
            </div>
          )}

          {/* Available Plans */}
          {plans && plans.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">💳 Available Plans</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="border rounded p-3">
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-gray-600">
                      {plan.description}
                    </div>
                    <div className="text-lg font-bold mt-2">
                      ${plan.monthlyPrice}/month
                    </div>
                    <div className="text-xs text-gray-500">
                      {plan.maxUsers} users, {plan.maxProducts} products
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stripe Prices */}
          {prices && prices.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">💰 Stripe Prices</h4>
              <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                {prices.map((price) => (
                  <div key={price.id} className="text-xs border-b py-1">
                    <strong>{price.productName}</strong> - $
                    {(price.unitAmount / 100).toFixed(2)}/{price.interval}
                    <div className="text-gray-600">ID: {price.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="space-y-3">
            <h4 className="font-semibold">🧪 Test Actions</h4>
            <div className="flex gap-2">
              {!subscription && (
                <Button
                  onClick={handleCreateTrial}
                  disabled={isCreatingTrial}
                  size="sm"
                  variant="outline"
                >
                  {isCreatingTrial ? "Creating..." : "Create Trial"}
                </Button>
              )}

              <Button
                onClick={handleCreateCheckout}
                disabled={isCreatingCheckout || !prices?.length}
                size="sm"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isCreatingCheckout ? "Creating..." : "Test Stripe Checkout"}
              </Button>
            </div>
          </div>

          {/* API Debug Information */}
          <div>
            <h4 className="font-semibold mb-2">🔍 API Debug Info</h4>
            <div className="bg-gray-50 p-3 rounded text-xs space-y-2">
              <div>
                <strong>Organization ID:</strong>{" "}
                {organization?.id || "❌ No Org ID"}
              </div>
              <div>
                <strong>Subscription API:</strong>
                {subLoading
                  ? " 🔄 Loading..."
                  : subError
                  ? ` ❌ Error: ${subError.message}`
                  : subscription
                  ? " ✅ Success"
                  : " ⚠️ No data"}
              </div>
              <div>
                <strong>Usage API:</strong>
                {usageLoading
                  ? " 🔄 Loading..."
                  : usageError
                  ? ` ❌ Error: ${usageError.message}`
                  : usage
                  ? " ✅ Success"
                  : " ⚠️ No data"}
              </div>
              <div>
                <strong>Plans API:</strong>
                {plansLoading
                  ? " 🔄 Loading..."
                  : plansError
                  ? ` ❌ Error: ${plansError.message}`
                  : plans
                  ? " ✅ Success"
                  : " ⚠️ No data"}
              </div>
              <div>
                <strong>Prices API:</strong>
                {pricesLoading
                  ? " 🔄 Loading..."
                  : pricesError
                  ? ` ❌ Error: ${pricesError.message}`
                  : prices
                  ? " ✅ Success"
                  : " ⚠️ No data"}
              </div>
              {subscription && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <strong>Raw Subscription Data:</strong>
                  <pre className="text-xs overflow-auto max-h-32">
                    {JSON.stringify(subscription, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* API Status */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>
              Subscription Loading: {subLoading ? "✅" : "❌"}{" "}
              {subError && `(Error: ${subError.message})`}
            </div>
            <div>
              Usage Loading: {usageLoading ? "✅" : "❌"}{" "}
              {usageError && `(Error: ${usageError.message})`}
            </div>
            <div>
              Plans Loading: {plansLoading ? "✅" : "❌"}{" "}
              {plansError && `(Error: ${plansError.message})`}
            </div>
            <div>
              Prices Loading: {pricesLoading ? "✅" : "❌"}{" "}
              {pricesError && `(Error: ${pricesError.message})`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
