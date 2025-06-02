import { useState, useEffect } from "react";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { Check, User, Building2, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth-store";
import {
  useSyncUser,
  useCompleteUserOnboarding,
  useSyncOrganization,
  useCompleteOrganizationSetup,
} from "@/hooks/use-api";
import { toast } from "sonner";
import { UserProfileFormComponent } from "./user-profile-form";
import { OrganizationCreationStep } from "./organization-creation-step";
import { OrganizationSetupForm } from "./organization-setup-form";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface UserProfileForm {
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: string;
}

interface ComprehensiveOrganizationSetupForm {
  // Basic Information
  description?: string;
  industry?: string;

  // Contact Information
  email?: string;
  phone?: string;
  website?: string;

  // Address Information
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Business Details
  taxId?: string;
  businessRegistrationNumber?: string;

  // Regional Settings
  defaultCurrency: string;
  timeZone: string;
  dateFormat: string;

  // Business Preferences
  multiLocationEnabled: boolean;
}

export function ComprehensiveOnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const { user: clerkUser } = useUser();
  const { organization: clerkOrganization } = useOrganization();
  const { user: storeUser, organization: storeOrganization } = useAuthStore();

  const [activeTab, setActiveTab] = useState("user");
  const [completedSteps, setCompletedSteps] = useState({
    user: false,
    organization: false,
    orgCreation: false,
  });

  // Mutations
  const syncUserMutation = useSyncUser();
  const completeUserOnboardingMutation = useCompleteUserOnboarding();
  const syncOrganizationMutation = useSyncOrganization();
  const completeOrganizationSetupMutation = useCompleteOrganizationSetup();

  // Determine what steps are needed and completed
  useEffect(() => {
    const needsUserProfile = !storeUser?.hasCompletedOnboarding;
    const needsOrgCreation = !clerkOrganization;
    const needsOrgSetup =
      clerkOrganization && !storeOrganization?.hasCompletedSetup;

    // Update completed steps
    setCompletedSteps({
      user: storeUser?.hasCompletedOnboarding || false,
      organization: storeOrganization?.hasCompletedSetup || false,
      orgCreation: !!clerkOrganization,
    });

    // Auto-advance to next incomplete step
    if (needsUserProfile) {
      setActiveTab("user");
    } else if (needsOrgCreation) {
      setActiveTab("create-org");
    } else if (needsOrgSetup) {
      setActiveTab("setup-org");
    }
  }, [storeUser, storeOrganization, clerkOrganization]);

  // Handle user profile submission
  const handleUserProfileSubmit = async (data: UserProfileForm) => {
    try {
      // Update Clerk user first if needed
      if (
        clerkUser &&
        (clerkUser.firstName !== data.firstName ||
          clerkUser.lastName !== data.lastName)
      ) {
        await clerkUser.update({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }

      // Sync with backend and complete onboarding
      await syncUserMutation.mutateAsync({
        email: clerkUser?.emailAddresses[0]?.emailAddress || "",
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        imageUrl: clerkUser?.imageUrl,
      });

      await completeUserOnboardingMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        preferences: data.preferences,
      });

      toast.success("Profile completed successfully!");

      // Move to next step
      if (!clerkOrganization) {
        setActiveTab("create-org");
      } else if (!storeOrganization?.hasCompletedSetup) {
        setActiveTab("setup-org");
      } else {
        onComplete();
      }
    } catch (error) {
      toast.error("Failed to complete profile. Please try again.");
    }
  };

  // Handle comprehensive organization setup submission
  const handleOrganizationSetupSubmit = async (
    data: ComprehensiveOrganizationSetupForm
  ) => {
    try {
      await completeOrganizationSetupMutation.mutateAsync(data);
      toast.success("Organization setup completed successfully!");
      onComplete();
    } catch (error) {
      toast.error("Failed to complete organization setup. Please try again.");
    }
  };

  // Handle organization creation success
  const handleOrganizationCreated = () => {
    toast.success("Organization created successfully!");
    setTimeout(() => {
      setActiveTab("setup-org");
    }, 1000);
  };

  const isLoading =
    syncUserMutation.isPending ||
    completeUserOnboardingMutation.isPending ||
    syncOrganizationMutation.isPending ||
    completeOrganizationSetupMutation.isPending;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onComplete();
        }
      }}
    >
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[800px] max-h-[98vh] overflow-y-auto p-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Complete Your Business Setup
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="user"
              className="flex items-center gap-2"
              disabled={completedSteps.user && activeTab !== "user"}
            >
              {completedSteps.user ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <User className="w-4 h-4" />
              )}
              Your Profile
            </TabsTrigger>
            <TabsTrigger
              value="create-org"
              className="flex items-center gap-2"
              disabled={
                !completedSteps.user ||
                (completedSteps.orgCreation && activeTab !== "create-org")
              }
            >
              {completedSteps.orgCreation ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
              Create Business
            </TabsTrigger>
            <TabsTrigger
              value="setup-org"
              className="flex items-center gap-2"
              disabled={
                !completedSteps.orgCreation || completedSteps.organization
              }
            >
              {completedSteps.organization ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              Business Details
            </TabsTrigger>
          </TabsList>

          {/* User Profile Tab */}
          <TabsContent value="user" className="space-y-4">
            <UserProfileFormComponent
              onSubmit={handleUserProfileSubmit}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Create Organization Tab */}
          <TabsContent value="create-org" className="space-y-4">
            <OrganizationCreationStep />
          </TabsContent>

          {/* Comprehensive Organization Setup Tab */}
          <TabsContent value="setup-org" className="space-y-6">
            <OrganizationSetupForm
              onSubmit={handleOrganizationSetupSubmit}
              onBack={() => setActiveTab("create-org")}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {["user", "create-org", "setup-org"].map((step, index) => {
            const isCompleted =
              step === "user"
                ? completedSteps.user
                : step === "create-org"
                ? completedSteps.orgCreation
                : completedSteps.organization;
            const isActive = activeTab === step;

            return (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  isCompleted
                    ? "bg-green-500"
                    : isActive
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              />
            );
          })}
        </div>

        <div className="text-center text-xs text-gray-500 mt-2">
          {activeTab === "user" && "Step 1 of 3: Complete your profile"}
          {activeTab === "create-org" &&
            "Step 2 of 3: Create your business organization"}
          {activeTab === "setup-org" &&
            "Step 3 of 3: Configure business details"}
        </div>
      </DialogContent>
    </Dialog>
  );
}
