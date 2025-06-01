// src/components/auth/auth-router.tsx - Fixed to handle organization context
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

function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export function AuthRouter() {
  const location = useLocation();
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { organization: clerkOrganization, isLoaded: orgLoaded } =
    useOrganization();
  const [isInitializing, setIsInitializing] = useState(false);

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

  // SIMPLE DETECTION - just check the boolean flags!
  const needsUserOnboarding = storeUser && !storeUser.hasCompletedOnboarding;
  const needsOrgSetup =
    storeOrganization && !storeOrganization.hasCompletedSetup;
  const needsOnboarding = needsUserOnboarding || needsOrgSetup;

  // Check if JWT has organization context
  const checkOrganizationContext = async () => {
    try {
      const token = await getToken({ template: "logistiq-backend" });
      if (token) {
        // Decode JWT to check if org_id is populated
        const payload = JSON.parse(atob(token.split(".")[1]));
        const orgId = payload.org_id;

        // Check if org_id is still a template or empty
        const hasOrgContext =
          orgId && !orgId.includes("{{") && orgId !== "{{org.id}}";
        console.log("JWT org context check:", { orgId, hasOrgContext });
        return hasOrgContext;
      }
    } catch (error) {
      console.error("Failed to check JWT organization context:", error);
    }
    return false;
  };

  // Auto-sync user and organization when they sign in
  useEffect(() => {
    const initializeData = async () => {
      // Early return guards
      if (!isSignedIn || !clerkUser || !isLoaded || !orgLoaded) {
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
      const needsOrgSync = clerkOrganization && !storeOrganization;

      if (!needsUserSync && !needsOrgSync) {
        return; // Nothing to sync
      }

      setIsInitializing(true);

      try {
        // Always sync user first (this doesn't require org context)
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

        // Only sync organization if we have proper context
        if (needsOrgSync) {
          console.log("🔍 Checking organization context...");
          const hasOrgContext = await checkOrganizationContext();

          if (hasOrgContext) {
            console.log(
              "🔄 Syncing organization with backend:",
              clerkOrganization.name
            );

            const orgResult = await syncOrganizationMutation.mutateAsync({
              name: clerkOrganization.name,
              slug: clerkOrganization.slug || undefined,
              imageUrl: clerkOrganization.imageUrl || undefined,
            });

            console.log("✅ Organization synced:", orgResult);
            setOrganization(orgResult);
          } else {
            console.log("⚠️ No organization context in JWT, skipping org sync");
            // We'll handle this in the organization creation flow
          }
        }
      } catch (error: any) {
        console.error("❌ Failed to sync data:", error);

        // If it's an organization context error, don't block the UI
        if (error.message?.includes("No organization context")) {
          console.log(
            "ℹ️ Organization context missing, user needs to complete setup"
          );
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, [
    isSignedIn,
    isLoaded,
    orgLoaded, // Wait for organization loading too
    clerkUser?.id, // Only re-run if user ID changes
    clerkOrganization?.id, // Only re-run if org ID changes
    storeUser?.id, // Only re-run if store user changes
    storeOrganization?.id, // Only re-run if store org changes
  ]);

  // Show loading spinner
  if (!isLoaded || !orgLoaded || isInitializing) {
    return (
      <LoadingScreen
        message={
          !isLoaded || !orgLoaded ? "Loading..." : "Setting up your account..."
        }
      />
    );
  }

  // Public routes
  if (isPublicRoute) {
    // If already signed in and has organization and no onboarding needed, redirect to dashboard
    if (
      isSignedIn &&
      clerkOrganization &&
      storeUser &&
      storeOrganization &&
      !needsOnboarding
    ) {
      return <Navigate to="/dashboard" replace />;
    }
    // If signed in but no organization, redirect to create one
    if (isSignedIn && !clerkOrganization) {
      return <Navigate to="/create-organization" replace />;
    }
    // If signed in and needs onboarding, redirect to onboarding
    if (isSignedIn && needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
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
      // After organization creation, we might need to sync it
      if (!storeOrganization) {
        // Try to sync the organization in the background
        return <LoadingScreen message="Setting up your organization..." />;
      }
      return (
        <Navigate to={needsOnboarding ? "/onboarding" : "/dashboard"} replace />
      );
    }
    return <Outlet />;
  }

  // Onboarding route
  if (location.pathname === "/onboarding") {
    // Allow onboarding even if organization isn't synced yet
    // The onboarding process will handle the sync
    return <Outlet />;
  }

  // Routes that require organization setup
  if (!clerkOrganization) {
    return <Navigate to="/create-organization" replace />;
  }

  // For main app routes, we need both user and organization synced
  if (!storeUser) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  // If we have organization in Clerk but not synced to backend
  if (clerkOrganization && !storeOrganization) {
    return <LoadingScreen message="Setting up your organization..." />;
  }

  // Routes that require complete onboarding
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // All checks passed!
  return <Outlet />;
}
