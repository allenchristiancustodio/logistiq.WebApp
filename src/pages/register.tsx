import { SignUp } from "@clerk/clerk-react";
import { Building2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Logistiq</h1>
          </div>
          <h2 className="text-xl text-gray-600">
            Create your account and start managing inventory
          </h2>
        </div>

        {/* Clerk Sign Up Component */}
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              card: "shadow-xl border-0",
              headerTitle: "text-gray-900",
              headerSubtitle: "text-gray-600",
            },
          }}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
