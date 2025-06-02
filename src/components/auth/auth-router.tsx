import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import {
  useAuth as useClerkAuth,
  useUser,
  useOrganization,
} from "@clerk/clerk-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ComprehensiveOnboardingModal } from "@/components/onboarding/atomic-onboarding-modal";
import { useAuthStore } from "@/stores/auth-store";
import { useSyncUser, useSyncOrganization } from "@/hooks/use-api";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/sso-callback"];

export function AuthRouter() {
  const location = useLocation();
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { organization: clerkOrganization, isLoaded: orgLoaded } =
    useOrganization();
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastOrgId, setLastOrgId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const {
    user: storeUser,
    organization: storeOrganization,
    setUser,
    setOrganization,
    clearData,
  } = useAuthStore();

  const syncUserMutation = useSyncUser();
  const syncOrganizationMutation = useSyncOrganization();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // DETECT ORGANIZATION SWITCH
  useEffect(() => {
    const currentOrgId = clerkOrganization?.id || null;

    // If organization changed, clear store and re-sync
    if (lastOrgId && currentOrgId && lastOrgId !== currentOrgId) {
      console.log(
        "🔄 Organization switched from",
        lastOrgId,
        "to",
        currentOrgId
      );
      clearData();
    }

    setLastOrgId(currentOrgId);
  }, [clerkOrganization?.id, lastOrgId, clearData]);

  // Determine if onboarding is needed
  const needsUserOnboarding = !storeUser?.hasCompletedOnboarding;
  const needsOrgCreation = !clerkOrganization;
  const needsOrgSetup =
    clerkOrganization && !storeOrganization?.hasCompletedSetup;
  const needsOnboarding =
    needsUserOnboarding || needsOrgCreation || needsOrgSetup;

  console.log("🔍 Atomic Auth Debug:", {
    location: location.pathname,
    isSignedIn,
    clerkOrganization: clerkOrganization?.name,
    storeUser: storeUser?.email,
    storeOrg: storeOrganization?.name,
    needsUserOnboarding,
    needsOrgCreation,
    needsOrgSetup,
    needsOnboarding,
    showOnboarding,
  });

  // Auto-sync user and organization data
  useEffect(() => {
    const initializeData = async () => {
      if (!isSignedIn || !clerkUser || !isLoaded || !orgLoaded) {
        return;
      }

      if (
        syncUserMutation.isPending ||
        syncOrganizationMutation.isPending ||
        isInitializing
      ) {
        return;
      }

      const needsUserSync = !storeUser;
      const needsOrgSync = clerkOrganization && !storeOrganization;

      if (!needsUserSync && !needsOrgSync) {
        return;
      }

      setIsInitializing(true);

      try {
        // Always sync user first (basic sync, not completing onboarding yet)
        if (needsUserSync) {
          console.log(
            "🔄 Initial user sync:",
            clerkUser.emailAddresses[0]?.emailAddress
          );
          const userResult = await syncUserMutation.mutateAsync({
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            phone: clerkUser.phoneNumbers[0]?.phoneNumber,
            imageUrl: clerkUser.imageUrl,
          });
          setUser(userResult);
          console.log(
            "✅ User synced - onboarding completed:",
            userResult.hasCompletedOnboarding
          );
        }

        // Sync organization if available (basic sync, not completing setup yet)
        if (needsOrgSync) {
          console.log("🔄 Initial organization sync:", clerkOrganization.name);
          const orgResult = await syncOrganizationMutation.mutateAsync({
            name: clerkOrganization.name,
            slug: clerkOrganization.slug || undefined,
            imageUrl: clerkOrganization.imageUrl || undefined,
          });
          setOrganization(orgResult);
          console.log(
            "✅ Organization synced - setup completed:",
            orgResult.hasCompletedSetup
          );
        }
      } catch (error: any) {
        console.error("❌ Failed to sync data:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, [
    isSignedIn,
    isLoaded,
    orgLoaded,
    clerkUser?.id,
    clerkOrganization?.id,
    storeUser?.id,
    storeOrganization?.id,
  ]);

  // Show loading spinner during initialization
  if (!isLoaded || !orgLoaded || isInitializing) {
    return <LoadingScreen message="Setting up your account..." />;
  }

  // PUBLIC ROUTES HANDLING
  if (isPublicRoute) {
    if (isSignedIn) {
      // Check if onboarding is needed, but don't block - let main app handle it
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  }

  // PROTECTED ROUTES HANDLING
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Handle onboarding modal
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // The store will be updated by the onboarding mutations
    // No need to do anything else here
  };

  // Show onboarding modal if needed (this replaces the old onboarding page)
  if (needsOnboarding && !showOnboarding) {
    setShowOnboarding(true);
  }

  // MAIN APP ROUTES
  return (
    <>
      <Outlet />
      {showOnboarding && (
        <ComprehensiveOnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}
