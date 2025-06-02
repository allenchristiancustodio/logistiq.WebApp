import { useState } from "react";
import { ExternalLink, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useCurrentSubscription,
  useCreatePortalSession,
} from "@/hooks/use-api";
import { toast } from "sonner";

export function BillingManagement() {
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const { data: subscription } = useCurrentSubscription();
  const createPortalMutation = useCreatePortalSession();

  const handleOpenPortal = async () => {
    if (!subscription?.stripeCustomerId) {
      toast.error("No billing information found");
      return;
    }

    setIsPortalLoading(true);

    try {
      const response = await createPortalMutation.mutateAsync({
        customerId: subscription.stripeCustomerId,
        returnUrl: window.location.href,
      });

      window.open(response.sessionUrl, "_blank");
    } catch (error: any) {
      toast.error("Failed to open billing portal");
    } finally {
      setIsPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
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

  const getNextBillingAmount = () => {
    if (!subscription || subscription.isTrialActive) return null;
    return subscription.monthlyPrice;
  };

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No billing information
            </h3>
            <p className="text-gray-500">
              Set up billing to continue using Logistiq after your trial.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Current Plan: {subscription.planName}
                <Badge variant={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </div>
            <Button
              onClick={handleOpenPortal}
              disabled={isPortalLoading}
              variant="outline"
            >
              {isPortalLoading ? "Opening..." : "Manage Billing"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Billing Amount */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {subscription.isTrialActive
                  ? "Free Trial"
                  : formatCurrency(subscription.monthlyPrice)}
              </div>
              <div className="text-sm text-gray-500">
                {subscription.isTrialActive ? "Current period" : "per month"}
              </div>
            </div>

            {/* Next Billing Date */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {formatDate(subscription.endDate)}
              </div>
              <div className="text-sm text-gray-500">
                {subscription.isTrialActive ? "Trial ends" : "Next billing"}
              </div>
            </div>

            {/* Days Remaining */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {subscription.daysRemaining}
              </div>
              <div className="text-sm text-gray-500">days remaining</div>
            </div>
          </div>

          {/* Trial Warning */}
          {subscription.isTrialActive && subscription.daysRemaining <= 7 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">
                    Trial Ending Soon
                  </h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Your trial expires in {subscription.daysRemaining} days.
                    {getNextBillingAmount() && (
                      <>
                        {" "}
                        You'll be charged{" "}
                        {formatCurrency(getNextBillingAmount()!)} on{" "}
                        {formatDate(subscription.endDate)}.
                      </>
                    )}
                  </p>
                  <Button size="sm" className="mt-3" onClick={handleOpenPortal}>
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Notice */}
          {subscription.status === "Cancelled" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">
                    Subscription Cancelled
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Your subscription has been cancelled and will end on{" "}
                    {formatDate(subscription.endDate)}. You'll continue to have
                    access until then.
                  </p>
                  <Button size="sm" className="mt-3" onClick={handleOpenPortal}>
                    Reactivate Subscription
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Update your payment method, download invoices, and view billing
              history.
            </p>
            <Button
              variant="outline"
              onClick={handleOpenPortal}
              disabled={isPortalLoading}
            >
              Manage Payment Method
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and download your invoices and payment history.
            </p>
            <Button
              variant="outline"
              onClick={handleOpenPortal}
              disabled={isPortalLoading}
            >
              View Invoices
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
