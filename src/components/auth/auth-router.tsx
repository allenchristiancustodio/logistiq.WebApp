// src/components/auth/auth-router.tsx - Fixed timing issue
import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import {
  useAuth as useClerkAuth,
  useUser,
  useOrganization,
} from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useSyncUser, useSyncOrganization } from "@/hooks/use-api";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/sso-callback"];

export function AuthRouter() {
  const location = useLocation();
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { organization: clerkOrganization } = useOrganization();
  const [isInitializing, setIsInitializing] = useState(false);
  const [syncAttempts, setSyncAttempts] = useState(0);

  const {
    user: storeUser,
    organization: storeOrganization,
    setUser,
    setOrganization,
  } = useAuthStore();

  const syncUserMutation = useSyncUser();
  const syncOrganizationMutation = useSyncOrganization();

  // Determine if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // Auto-sync user and organization when they sign in
  useEffect(() => {
    const initializeData = async () => {
      // Early return guards
      if (!isSignedIn || !clerkUser || !isLoaded) {
        return;
      }

      // Prevent mutations if already in progress
      if (
        syncUserMutation.isPending ||
        syncOrganizationMutation.isPending ||
        isInitializing
      ) {
        return;
      }

      // Check if we need to sync anything
      const needsUserSync = !storeUser;
      const needsOrgSync =
        clerkOrganization && !storeOrganization && syncAttempts < 3;

      if (!needsUserSync && !needsOrgSync) {
        return; // Nothing to sync
      }

      setIsInitializing(true);

      try {
        // Sync user if needed
        if (needsUserSync) {
          console.log(
            "🔄 Syncing user with backend:",
            clerkUser.emailAddresses[0]?.emailAddress
          );

          const userResult = await syncUserMutation.mutateAsync({
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            phone: clerkUser.phoneNumbers[0]?.phoneNumber,
            imageUrl: clerkUser.imageUrl,
          });

          console.log("✅ User synced:", userResult);
          setUser(userResult);
        }

        // Sync organization if needed
        if (needsOrgSync) {
          console.log(
            "🔄 Syncing organization with backend:",
            clerkOrganization.name
          );

          try {
            // Get a fresh token to ensure it has org claims
            const token = await getToken({ template: "logistiq-backend" });
            console.log("🔑 Got fresh token for org sync");

            const orgResult = await syncOrganizationMutation.mutateAsync({
              name: clerkOrganization.name,
              slug: clerkOrganization.slug || undefined,
              imageUrl: clerkOrganization.imageUrl || undefined,
            });

            console.log("✅ Organization synced:", orgResult);
            setOrganization(orgResult);
            setSyncAttempts(0); // Reset attempts on success
          } catch (orgError: any) {
            console.warn("⚠️ Organization sync failed:", orgError.message);
            setSyncAttempts((prev) => prev + 1);

            // If it's the "No organization context found" error, wait and retry
            if (
              orgError.message.includes("No organization context found") &&
              syncAttempts < 2
            ) {
              console.log("⏳ Waiting for JWT to refresh, will retry...");
              setTimeout(() => {
                setIsInitializing(false);
              }, 2000); // Retry after 2 seconds
              return;
            } else {
              throw orgError; // Re-throw other errors
            }
          }
        }
      } catch (error: any) {
        console.error("❌ Failed to sync data:", error);
        // Don't block the UI for organization sync errors
        if (!error.message.includes("No organization context found")) {
          // Re-throw for other errors
          throw error;
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, [
    isSignedIn,
    isLoaded,
    clerkUser?.id, // Only re-run if user ID changes
    clerkOrganization?.id, // Only re-run if org ID changes
    storeUser?.id, // Only re-run if store user changes
    storeOrganization?.id, // Only re-run if store org changes
    syncAttempts, // Re-run when sync attempts change
  ]);

  // Show loading spinner
  if (!isLoaded || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {!isLoaded
              ? "Loading..."
              : syncAttempts > 0
              ? "Syncing organization..."
              : "Setting up your account..."}
          </p>
        </div>
      </div>
    );
  }

  // Public routes
  if (isPublicRoute) {
    // If already signed in and has organization, redirect to dashboard
    if (isSignedIn && clerkOrganization && storeUser && storeOrganization) {
      return <Navigate to="/dashboard" replace />;
    }
    // If signed in but no organization, redirect to create one
    if (isSignedIn && !clerkOrganization) {
      return <Navigate to="/create-organization" replace />;
    }
    return <Outlet />;
  }

  // Protected routes - require authentication
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Organization creation route
  if (location.pathname === "/create-organization") {
    if (clerkOrganization) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  }

  // Routes that require organization setup
  if (!clerkOrganization) {
    return <Navigate to="/create-organization" replace />;
  }

  // Wait for backend data to be synced (but allow proceeding without organization sync after attempts)
  if (!storeUser || (!storeOrganization && syncAttempts < 3)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your workspace...</p>
          {syncAttempts > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Syncing organization data... (attempt {syncAttempts}/3)
            </p>
          )}
        </div>
      </div>
    );
  }

  // All checks passed! (or we've exhausted sync attempts and can proceed)
  return <Outlet />;
}
