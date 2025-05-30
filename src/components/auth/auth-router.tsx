import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateOrUpdateUser } from "@/hooks/use-api";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthRouter() {
  const location = useLocation();
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [isInitializing, setIsInitializing] = useState(false);

  const { user: storeUser, setUser } = useAuthStore();
  const createOrUpdateUserMutation = useCreateOrUpdateUser();

  // Determine if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  // Initialize user data when they sign in
  useEffect(() => {
    const initializeUser = async () => {
      if (!isSignedIn || !clerkUser || !isLoaded || storeUser) {
        return; // Already have user data or not ready
      }

      setIsInitializing(true);

      try {
        console.log(
          "🔄 Initializing user with Clerk:",
          clerkUser.emailAddresses[0]?.emailAddress
        );

        const result = await createOrUpdateUserMutation.mutateAsync({
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
        });

        console.log("✅ User initialized:", result);

        setUser({
          id: result.userId,
          email: result.email,
          fullName: result.fullName,
          hasActiveCompany: result.hasActiveCompany,
          currentCompanyId: result.currentCompanyId,
          currentCompanyName: result.currentCompanyName,
        });
      } catch (error: any) {
        console.error("❌ Failed to initialize user:", error);
        // Don't block the UI, user can try again
      } finally {
        setIsInitializing(false);
      }
    };

    initializeUser();
  }, [
    isSignedIn,
    clerkUser,
    isLoaded,
    storeUser,
    createOrUpdateUserMutation,
    setUser,
  ]);

  // Show loading spinner
  if (!isLoaded || isInitializing || createOrUpdateUserMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {!isLoaded ? "Loading..." : "Setting up your account..."}
          </p>
        </div>
      </div>
    );
  }

  // Public routes
  if (isPublicRoute) {
    // If already signed in, redirect to dashboard or onboarding
    if (isSignedIn && storeUser) {
      return storeUser.hasActiveCompany ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Navigate to="/onboarding" replace />
      );
    }
    return <Outlet />;
  }

  // Protected routes - require authentication
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user data to be loaded
  if (!storeUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Onboarding route
  if (location.pathname === "/onboarding") {
    if (storeUser.hasActiveCompany) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Outlet />;
  }

  // Routes that require company setup
  if (!storeUser.hasActiveCompany) {
    return <Navigate to="/onboarding" replace />;
  }

  // All checks passed!
  return <Outlet />;
}
