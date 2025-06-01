// src/App.tsx - Updated for Clerk Organizations
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import ClerkProviderWrapper from "@/lib/clerk-provider";
import { AuthRouter } from "@/components/auth/auth-router";
import MainLayout from "@/components/layout/main-layout";

// Pages
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import SSOCallbackPage from "@/pages/sso-callback";
import CreateOrganizationPage from "@/pages/create-organization";
import DashboardPage from "@/pages/dashboard";
import ProductsPage from "@/pages/products";
import InventoryPage from "@/pages/inventory";
import UsersPage from "@/pages/userpage";
import SettingsPage from "@/pages/settings";
import ExpensesPage from "@/pages/expenses";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (
          error?.message?.includes("401") ||
          error?.message?.includes("403")
        ) {
          return false;
        }
        // Limit retries to prevent resource exhaustion
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on auth errors
        if (
          error?.message?.includes("401") ||
          error?.message?.includes("403") ||
          error?.message?.includes("ERR_INSUFFICIENT_RESOURCES")
        ) {
          return false;
        }
        return failureCount < 1; // Only retry once for mutations
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ClerkProviderWrapper>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthRouter />}>
                {/* Public Routes */}
                <Route path="/login/*" element={<LoginPage />} />
                <Route path="/register/*" element={<RegisterPage />} />

                {/* SSO Callback Route - Required for Clerk OAuth/SSO */}
                <Route path="/sso-callback" element={<SSOCallbackPage />} />

                {/* Protected Routes with Layout */}
                <Route element={<MainLayout />}>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route
                    path="/create-organization"
                    element={<CreateOrganizationPage />}
                  />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                </Route>
              </Route>
            </Routes>
            <Toaster position="top-right" />
          </BrowserRouter>
        </ClerkProviderWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
