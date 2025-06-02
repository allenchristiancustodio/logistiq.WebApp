import { useState } from "react";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { CreditCard, Loader2, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateCheckoutSession, useStripePrices } from "@/hooks/use-api";
import { toast } from "sonner";

interface StripeCheckoutProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultPlan?: string;
}

export function StripeCheckout({
  onSuccess,
  onCancel,
  defaultPlan,
}: StripeCheckoutProps) {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [selectedPlan, setSelectedPlan] = useState<string>(defaultPlan || "");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: prices, isLoading: pricesLoading } = useStripePrices();
  const createCheckoutMutation = useCreateCheckoutSession();

  // Group prices by product and interval
  const groupedPrices =
    prices?.reduce((acc, price) => {
      const key = `${price.productName.toLowerCase()}_${price.interval}`;
      acc[key] = price;
      return acc;
    }, {} as Record<string, (typeof prices)[0]>) || {};

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 5 team members",
        "500 products",
        "1,000 orders per month",
        "2 warehouses",
        "Basic reporting",
        "Email support",
      ],
      monthlyPrice: groupedPrices["starter_month"],
      yearlyPrice: groupedPrices["starter_year"],
      popular: false,
    },
    {
      id: "professional",
      name: "Professional",
      description: "Advanced features for growing businesses",
      features: [
        "Up to 15 team members",
        "2,000 products",
        "5,000 orders per month",
        "5 warehouses",
        "Advanced reporting",
        "Invoicing & billing",
        "Priority support",
      ],
      monthlyPrice: groupedPrices["professional_month"],
      yearlyPrice: groupedPrices["professional_year"],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Unlimited everything for large organizations",
      features: [
        "Unlimited team members",
        "Unlimited products",
        "Unlimited orders",
        "Unlimited warehouses",
        "Custom reporting",
        "API access",
        "Dedicated support",
        "Custom integrations",
      ],
      monthlyPrice: groupedPrices["enterprise_month"],
      yearlyPrice: groupedPrices["enterprise_year"],
      popular: false,
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user || !organization) {
      toast.error("User or organization information not available");
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(planId);

    try {
      const plan = plans.find((p) => p.id === planId);
      const price =
        billingInterval === "month" ? plan?.monthlyPrice : plan?.yearlyPrice;

      if (!price) {
        toast.error("Price information not available");
        return;
      }

      const checkoutData = {
        priceId: price.id,
        customerEmail: user.emailAddresses[0]?.emailAddress || "",
        customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        organizationName: organization.name,
        successUrl: `${window.location.origin}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        isAnnual: billingInterval === "year",
        trialDays: 14, // 14-day trial
      };

      const response = await createCheckoutMutation.mutateAsync(checkoutData);

      // Redirect to Stripe Checkout
      window.location.href = response.sessionUrl;

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
      setIsProcessing(false);
    }
  };

  const formatPrice = (price?: NonNullable<typeof prices>[number]) => {
    if (!price) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unitAmount / 100);
  };

  const getYearlySavings = (
    monthly?: NonNullable<typeof prices>[number],
    yearly?: NonNullable<typeof prices>[number]
  ) => {
    if (!monthly || !yearly) return 0;
    const monthlyCost = (monthly.unitAmount / 100) * 12;
    const yearlyCost = yearly.unitAmount / 100;
    return monthlyCost - yearlyCost;
  };

  if (pricesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading pricing information...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Billing Toggle */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 mb-6">
          Start with a 14-day free trial. No credit card required.
        </p>

        <Tabs
          value={billingInterval}
          onValueChange={(value) =>
            setBillingInterval(value as "month" | "year")
          }
        >
          <TabsList className="grid w-fit grid-cols-2 mx-auto">
            <TabsTrigger value="month">Monthly</TabsTrigger>
            <TabsTrigger value="year" className="relative">
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const currentPrice =
            billingInterval === "month" ? plan.monthlyPrice : plan.yearlyPrice;
          const isSelected = selectedPlan === plan.id;
          const isProcessingThis = isProcessing && isSelected;

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-blue-500 border-2" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    {formatPrice(currentPrice)}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {billingInterval}
                  </div>
                  {billingInterval === "year" && (
                    <div className="text-sm text-green-600 mt-1">
                      Save{" "}
                      {formatPrice({
                        ...currentPrice!,
                        unitAmount:
                          getYearlySavings(
                            plan.monthlyPrice,
                            plan.yearlyPrice
                          ) * 100,
                      })}{" "}
                      yearly
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing || !currentPrice}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isProcessingThis ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Start Free Trial
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  14-day free trial • Cancel anytime
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <div className="text-center mt-12 space-y-4">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-500" />
            14-day free trial
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-500" />
            No setup fees
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-500" />
            Cancel anytime
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Secure payments powered by Stripe. Your billing information is
          encrypted and secure.
        </p>
      </div>
    </div>
  );
}
