import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const { isSignedIn, isLoaded, getToken, signOut } = useClerkAuth();

  const { user: clerkUser } = useUser();

  const {
    user: storeUser,
    hasActiveCompany,
    currentCompanyId,
    currentCompanyName,
    needsOnboarding,
    clearCompanyData,
  } = useAuthStore();

  const logout = async () => {
    console.log("👋 Logging out user");
    clearCompanyData();
    await signOut();
  };

  return {
    // Auth status
    isAuthenticated: isSignedIn && isLoaded,
    isLoading: !isLoaded,

    // User data
    user: storeUser,
    clerkUser, // Raw Clerk user if needed

    // Token function
    getToken,

    // Company state
    hasActiveCompany,
    currentCompanyId,
    currentCompanyName,
    needsOnboarding: needsOnboarding(),

    // Actions
    logout,

    // Helper flags
    isReady: isLoaded && isSignedIn && !!storeUser,
  };
}
