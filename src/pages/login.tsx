import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Building2, ArrowRight, Shield, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { isAuthenticated, login, register } = useKindeAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    login();
  };

  const handleSignup = () => {
    register();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <Building2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Logistiq</h1>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Streamline Your Inventory Management
          </h2>

          <p className="text-xl text-gray-600 mb-8">
            The complete solution for multi-company inventory tracking, order
            management, and business insights.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Secure</h3>
              <p className="text-sm text-gray-600">Bank-level security</p>
            </div>
            <div className="text-center p-4">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Multi-Tenant</h3>
              <p className="text-sm text-gray-600">Multiple companies</p>
            </div>
            <div className="text-center p-4">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">Real-time insights</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Logistiq
            </h3>
            <p className="text-gray-600">
              Sign in to your account or create a new one to get started
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full flex items-center justify-center px-6 py-4 text-base font-medium"
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSignup}
              className="w-full flex items-center justify-center px-6 py-4 text-base font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              By signing in, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
