import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUIStore } from "@/stores/ui-store";
import AuthGuard from "@/components/auth/auth-guard";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { isSidebarCollapsed, isDarkMode } = useUIStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Pages that don't need the dashboard layout
  const noLayoutPages = ["/login", "/auth/status", "/onboarding"];
  const shouldShowLayout = !noLayoutPages.includes(location.pathname);

  if (!shouldShowLayout) {
    return (
      <AuthGuard requireAuth={location.pathname !== "/login"}>
        {children}
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div
        className={`${
          isDarkMode ? "dark" : "light"
        } flex bg-gray-50 text-gray-900 w-full min-h-screen`}
      >
        <Sidebar />
        <main
          className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 ${
            isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
          }`}
        >
          <Navbar />
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
