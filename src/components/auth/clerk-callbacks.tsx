import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateOrUpdateUser } from "@/hooks/use-api";

export function SignInCallback() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { setUser } = useAuthStore();
  const createOrUpdateUserMutation = useCreateOrUpdateUser();

  useEffect(() => {
    const handleSignInCallback = async () => {
      console.log("🔄 Processing sign-in callback...", {
        isSignedIn,
        isLoaded,
        clerkUser,
      });

      if (!isLoaded) {
        console.log("⏳ Clerk not loaded yet, waiting...");
        return;
      }

      if (!isSignedIn || !clerkUser) {
        console.log("❌ User not signed in, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        console.log("✅ User signed in, initializing user data...");

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

        // Redirect based on company status
        if (result.hasActiveCompany) {
          console.log("✅ User has active company, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          console.log("ℹ️ User needs onboarding, redirecting to onboarding");
          navigate("/onboarding");
        }
      } catch (error) {
        console.error("❌ Failed to initialize user:", error);
        navigate("/login");
      }
    };

    handleSignInCallback();
  }, [
    isSignedIn,
    isLoaded,
    clerkUser,
    navigate,
    setUser,
    createOrUpdateUserMutation,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export function SignUpCallback() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const { setUser } = useAuthStore();
  const createOrUpdateUserMutation = useCreateOrUpdateUser();

  useEffect(() => {
    const handleSignUpCallback = async () => {
      console.log("🔄 Processing sign-up callback...", {
        isSignedIn,
        isLoaded,
        clerkUser,
      });

      if (!isLoaded) {
        console.log("⏳ Clerk not loaded yet, waiting...");
        return;
      }

      if (!isSignedIn || !clerkUser) {
        console.log("❌ User not signed in, redirecting to register");
        navigate("/register");
        return;
      }

      try {
        console.log("✅ User registered, creating user profile...");

        const result = await createOrUpdateUserMutation.mutateAsync({
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
        });

        console.log("✅ User created:", result);

        setUser({
          id: result.userId,
          email: result.email,
          fullName: result.fullName,
          hasActiveCompany: result.hasActiveCompany,
          currentCompanyId: result.currentCompanyId,
          currentCompanyName: result.currentCompanyName,
        });

        // New users typically need onboarding
        console.log("ℹ️ New user, redirecting to onboarding");
        navigate("/onboarding");
      } catch (error) {
        console.error("❌ Failed to create user:", error);
        navigate("/register");
      }
    };

    handleSignUpCallback();
  }, [
    isSignedIn,
    isLoaded,
    clerkUser,
    navigate,
    setUser,
    createOrUpdateUserMutation,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Setting up your account...</p>
      </div>
    </div>
  );
}
