// src/components/auth/auth-guard.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateOrUpdateUser } from "@/hooks/use-api";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, getToken, error } = useKindeAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [localInitializing, setLocalInitializing] = useState(true);
  const initializeRef = useRef(false);

  const {
    setUser,
    clearAuth,
    setLoading,
    isInitialized,
    lastInitializedEmail,
    token: storedToken,
    user: storedUser,
    isAuthenticated: storeAuthenticated,
  } = useAuthStore();

  const createOrUpdateUserMutation = useCreateOrUpdateUser();

  // Check if user needs initialization
  const shouldInitialize = () => {
    if (!isAuthenticated || !user) return false;
    if (isInitialized && lastInitializedEmail === user.email) return false;
    if (storeAuthenticated && storedUser && storedToken) return false;
    return true;
  };

  // Initialize user data
  const initializeUser = async () => {
    if (!user || !isAuthenticated || initializeRef.current) return;

    initializeRef.current = true;

    try {
      console.log("AuthGuard: Initializing user...", { email: user.email });
      setLoading(true);

      const token = await getToken();
      if (!token) {
        console.error("AuthGuard: Failed to get access token");
        clearAuth();
        if (requireAuth && location.pathname !== "/login") {
          navigate("/login");
        }
        return;
      }

      const result = await createOrUpdateUserMutation.mutateAsync({
        email: user.email || "",
        firstName: user.givenName || "",
        lastName: user.familyName || "",
      });

      console.log("AuthGuard: User initialized successfully:", result);

      setUser(
        {
          id: result.userId,
          email: result.email,
          fullName: result.fullName,
          hasActiveCompany: result.hasActiveCompany,
          currentCompanyId: result.currentCompanyId,
          currentCompanyName: result.currentCompanyName,
        },
        token
      );

      // Handle routing based on company status
      if (!result.hasActiveCompany && location.pathname !== "/onboarding") {
        console.log("AuthGuard: Redirecting to onboarding");
        navigate("/onboarding");
      } else if (
        result.hasActiveCompany &&
        location.pathname === "/onboarding"
      ) {
        console.log("AuthGuard: Redirecting to dashboard");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("AuthGuard: Failed to initialize user:", error);

      if (error.message?.includes("401") || error.message?.includes("403")) {
        clearAuth();
        if (requireAuth && location.pathname !== "/login") {
          navigate("/login");
        }
      }
    } finally {
      setLoading(false);
      initializeRef.current = false;
    }
  };

  // Main authentication effect
  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      if (!mounted) return;

      try {
        // Still loading from Kinde
        if (isLoading) {
          setLocalInitializing(true);
          return;
        }

        // Handle authentication errors
        if (error) {
          console.error("AuthGuard: Kinde error:", error);
          clearAuth();
          if (requireAuth && location.pathname !== "/login") {
            navigate("/login");
          }
          setLocalInitializing(false);
          return;
        }

        // Not authenticated
        if (!isAuthenticated) {
          clearAuth();
          if (requireAuth && location.pathname !== "/login") {
            navigate("/login");
          }
          setLocalInitializing(false);
          return;
        }

        // Authenticated and needs initialization
        if (shouldInitialize()) {
          await initializeUser();
        }

        if (mounted) {
          setLocalInitializing(false);
        }
      } catch (error) {
        console.error("AuthGuard: Unexpected error:", error);
        if (mounted) {
          setLocalInitializing(false);
        }
      }
    };

    handleAuth();

    return () => {
      mounted = false;
    };
  }, [isLoading, isAuthenticated, error, user?.email]);

  // Reset when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      initializeRef.current = false;
      setLocalInitializing(true);
    }
  }, [isAuthenticated, user?.email]);

  // Show loading state
  const isLoadingState =
    isLoading || localInitializing || createOrUpdateUserMutation.isPending;

  if (isLoadingState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isLoading
              ? "Loading authentication..."
              : createOrUpdateUserMutation.isPending
              ? "Setting up your account..."
              : "Initializing..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
