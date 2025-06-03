// src/components/onboarding/atomic-onboarding-modal.tsx
import { useState, useEffect } from "react";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Building2, User, Crown } from "lucide-react";
import {
  useCompleteUserOnboarding,
  useUpdateUserProfile,
  useCompleteOrganizationSetup,
} from "@/hooks/use-auth-api";
import { useCreateTrialSubscription } from "@/hooks/use-subscriptions";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

interface ComprehensiveOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function ComprehensiveOnboardingModal({
  isOpen,
  onComplete,
}: ComprehensiveOnboardingModalProps) {
  const { user: clerkUser } = useUser();
  const { organization: clerkOrganization } = useOrganization();
  const { user: storeUser, organization: storeOrganization } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<
    "user" | "organization" | "subscription"
  >("user");
  const [userForm, setUserForm] = useState({
    firstName: clerkUser?.firstName || "",
    lastName: clerkUser?.lastName || "",
    phone: "",
    preferences: "",
  });

  const [orgForm, setOrgForm] = useState({
    description: "",
    industry: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    defaultCurrency: "USD",
    timeZone: "UTC",
  });

  const completeUserOnboardingMutation = useCompleteUserOnboarding();
  const completeOrgSetupMutation = useCompleteOrganizationSetup();
  const createTrialMutation = useCreateTrialSubscription();

  // Determine which steps are needed
  const needsUserOnboarding = !storeUser?.hasCompletedOnboarding;
  const needsOrgSetup =
    clerkOrganization && !storeOrganization?.hasCompletedSetup;
  const needsSubscription = true; // Always create trial subscription during onboarding

  useEffect(() => {
    if (needsUserOnboarding) {
      setCurrentStep("user");
    } else if (needsOrgSetup) {
      setCurrentStep("organization");
    } else if (needsSubscription) {
      setCurrentStep("subscription");
    }
  }, [needsUserOnboarding, needsOrgSetup, needsSubscription]);

  const handleUserSubmit = async () => {
    try {
      await completeUserOnboardingMutation.mutateAsync(userForm);
      toast.success("Profile completed!");

      if (needsOrgSetup) {
        setCurrentStep("organization");
      } else if (needsSubscription) {
        setCurrentStep("subscription");
      } else {
        onComplete();
      }
    } catch (error: any) {
      toast.error("Failed to complete profile setup");
    }
  };

  const handleOrgSubmit = async () => {
    try {
      await completeOrgSetupMutation.mutateAsync(orgForm);
      toast.success("Organization setup completed!");

      if (needsSubscription) {
        setCurrentStep("subscription");
      } else {
        onComplete();
      }
    } catch (error: any) {
      toast.error("Failed to complete organization setup");
    }
  };

  const handleSubscriptionSetup = async () => {
    try {
      await createTrialMutation.mutateAsync({
        planName: "Trial",
        trialDays: 14,
      });
      toast.success("Trial subscription activated!");
      onComplete();
    } catch (error: any) {
      toast.error("Failed to activate trial subscription");
      // Don't block onboarding if trial creation fails
      onComplete();
    }
  };

  const getProgress = () => {
    const steps = [
      needsUserOnboarding ? "user" : null,
      needsOrgSetup ? "organization" : null,
      needsSubscription ? "subscription" : null,
    ].filter(Boolean);

    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "user":
        return "Complete Your Profile";
      case "organization":
        return "Organization Setup";
      case "subscription":
        return "Activate Your Trial";
      default:
        return "Setup";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-blue-600" />
            Welcome to Logistiq
          </DialogTitle>
          <DialogDescription>
            Let's get your account set up in just a few steps
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getStepTitle()}</span>
              <span>{Math.round(getProgress())}% complete</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>

          {/* User Profile Step */}
          {currentStep === "user" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={userForm.firstName}
                    onChange={(e) =>
                      setUserForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="Your first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={userForm.lastName}
                    onChange={(e) =>
                      setUserForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferences">Tell us about your business</Label>
                <Textarea
                  id="preferences"
                  value={userForm.preferences}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      preferences: e.target.value,
                    }))
                  }
                  placeholder="What type of products do you manage? Any specific needs?"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUserSubmit}
                disabled={
                  completeUserOnboardingMutation.isPending ||
                  !userForm.firstName ||
                  !userForm.lastName
                }
                className="w-full"
              >
                {completeUserOnboardingMutation.isPending
                  ? "Saving..."
                  : "Continue"}
              </Button>
            </div>
          )}

          {/* Organization Setup Step */}
          {currentStep === "organization" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Organization Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={orgForm.industry}
                    onValueChange={(value) =>
                      setOrgForm((prev) => ({ ...prev, industry: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">
                        Manufacturing
                      </SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="food-beverage">
                        Food & Beverage
                      </SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={orgForm.email}
                    onChange={(e) =>
                      setOrgForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="business@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={orgForm.description}
                  onChange={(e) =>
                    setOrgForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Briefly describe your business..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={orgForm.phone}
                    onChange={(e) =>
                      setOrgForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={orgForm.website}
                    onChange={(e) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>

              <Button
                onClick={handleOrgSubmit}
                disabled={completeOrgSetupMutation.isPending}
                className="w-full"
              >
                {completeOrgSetupMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            </div>
          )}

          {/* Subscription Setup Step */}
          {currentStep === "subscription" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">
                  Activate Your Free Trial
                </h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Crown className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-blue-900 mb-2">
                  14-Day Free Trial
                </h4>
                <p className="text-blue-700 mb-4">
                  Get full access to Logistiq with our trial plan. No credit
                  card required!
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Up to 3 users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>50 products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>100 orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Basic reporting</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubscriptionSetup}
                disabled={createTrialMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createTrialMutation.isPending
                  ? "Activating Trial..."
                  : "Start Free Trial"}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Your trial will automatically start when you click the button
                above. You can upgrade or cancel anytime during the trial
                period.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
