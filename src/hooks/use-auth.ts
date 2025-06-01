import {
  useAuth as useClerkAuth,
  useUser,
  useOrganization,
} from "@clerk/clerk-react";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { isSignedIn, isLoaded, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { organization: clerkOrganization } = useOrganization();

  const {
    user: storeUser,
    organization: storeOrganization,
    isUserSynced,
    isOrganizationSynced,
    hasCompleteSetup,
    clearData,
  } = useAuthStore();

  const logout = async () => {
    console.log("👋 Logging out user");
    clearData();
    await signOut();
  };

  // Determine if we need onboarding
  const needsOrganizationSetup = isSignedIn && !clerkOrganization;

  return {
    // Auth status from Clerk
    isAuthenticated: isSignedIn && isLoaded,
    isLoading: !isLoaded,

    // Clerk data
    clerkUser,
    clerkOrganization,

    // Synced backend data
    user: storeUser,
    organization: storeOrganization,

    // Token function
    getToken,

    // Sync status
    isUserSynced: isUserSynced(),
    isOrganizationSynced: isOrganizationSynced(),
    hasCompleteSetup: hasCompleteSetup(),

    // Setup flags
    needsOrganizationSetup,
    needsUserSync: isSignedIn && !isUserSynced(),
    needsOrgSync: isSignedIn && clerkOrganization && !isOrganizationSynced(),

    // Actions
    logout,

    // Helper flags
    isReady: isLoaded && isSignedIn && hasCompleteSetup(),
  };
}
