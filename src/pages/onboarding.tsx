import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { CheckCircle, Circle, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import UserProfileCompletion from "@/components/onboarding/user-profile-completion";
import OrganizationSetup from "@/components/onboarding/organization-setup";
import { useAuthStore } from "@/stores/auth-store";
import { useOrganizationSync } from "@/hooks/use-organization-sync";
import { toast } from "sonner";

type OnboardingStep = "profile" | "organization" | "complete";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const { organization: clerkOrganization } = useOrganization();
  const { user: storeUser, organization: storeOrganization } = useAuthStore();
  const {
    syncOrganization,
    isLoading: isSyncingOrg,
    error: syncError,
  } = useOrganizationSync();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [isOrgSyncAttempted, setIsOrgSyncAttempted] = useState(false);

  // Handle organization sync on component mount
  useEffect(() => {
    const handleOrgSync = async () => {
      // If we have clerkOrganization but no storeOrganization, try to sync
      if (
        clerkOrganization &&
        !storeOrganization &&
        !isOrgSyncAttempted &&
        !isSyncingOrg
      ) {
        setIsOrgSyncAttempted(true);
        try {
          console.log("🔄 Attempting to sync organization from onboarding...");
          await syncOrganization();
          console.log("✅ Organization synced successfully");
        } catch (error: any) {
          console.error("❌ Organization sync failed:", error);
          if (error.message?.includes("context not yet available")) {
            toast.error(
              "Organization setup in progress. Please wait a moment and refresh if needed."
            );
          } else {
            toast.error(
              "Failed to load organization. Please try refreshing the page."
            );
          }
        }
      }
    };

    handleOrgSync();
  }, [
    clerkOrganization,
    storeOrganization,
    isOrgSyncAttempted,
    isSyncingOrg,
    syncOrganization,
  ]);

  // Update step detection when store data changes
  useEffect(() => {
    if (!storeUser || !storeUser.hasCompletedOnboarding) {
      setCurrentStep("profile");
    } else if (!storeOrganization || !storeOrganization.hasCompletedSetup) {
      setCurrentStep("organization");
    } else {
      setCurrentStep("complete");
    }
  }, [storeUser?.hasCompletedOnboarding, storeOrganization?.hasCompletedSetup]);

  const progress = (() => {
    switch (currentStep) {
      case "profile":
        return 25;
      case "organization":
        return 75;
      case "complete":
        return 100;
      default:
        return 0;
    }
  })();

  const handleProfileComplete = () => {
    console.log("Profile completed, checking next step...");
  };

  const handleOrganizationComplete = () => {
    console.log("Organization setup completed, checking final step...");
  };

  const handleFinishOnboarding = () => {
    navigate("/dashboard");
  };

  // Show loading if we don't have basic store data yet
  if (!storeUser || isSyncingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {!storeUser
              ? "Loading your account..."
              : "Setting up your organization..."}
          </p>
          {syncError && (
            <p className="text-red-600 text-sm mt-2">{syncError}</p>
          )}
        </div>
      </div>
    );
  }

  // Show error state if organization sync failed and we need it
  if (clerkOrganization && !storeOrganization && syncError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Setup Issue</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              We're having trouble setting up your organization. This usually
              resolves in a moment.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome to Logistiq
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Let's get your account set up in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Setup Progress
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          {currentStep === "profile" && (
            <UserProfileCompletion onComplete={handleProfileComplete} />
          )}

          {currentStep === "organization" && storeOrganization && (
            <OrganizationSetup onComplete={handleOrganizationComplete} />
          )}

          {currentStep === "organization" && !storeOrganization && (
            <Card className="max-w-md mx-auto text-center">
              <CardHeader>
                <CardTitle>Setting up your organization...</CardTitle>
              </CardHeader>
              <CardContent>
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">
                  Please wait while we prepare your organization settings.
                </p>
              </CardContent>
            </Card>
          )}

          {currentStep === "complete" && (
            <Card className="max-w-md mx-auto text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-600">
                  All Set!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Your account is now fully configured. You can start managing
                  your inventory right away.
                </p>
                <Button onClick={handleFinishOnboarding} className="w-full">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        {currentStep !== "complete" && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="text-gray-600"
            >
              Skip for now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
