import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import KindeProviderWrapper from "@/lib/kinde-provider";
import MainLayout from "@/components/layout/main-layout";

// Pages
import LoginPage from "@/pages/login";
import OnboardingPage from "@/pages/onboarding";
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
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <KindeProviderWrapper>
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
              </Routes>
            </MainLayout>
            <Toaster position="top-right" />
          </BrowserRouter>
        </KindeProviderWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
