// src/components/layout/main-layout.tsx
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useUIStore } from "@/stores/ui-store";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

export default function MainLayout() {
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

  // Pages that shouldn't show the sidebar/navbar layout
  const fullPageRoutes = ["/onboarding"];
  const shouldShowFullLayout = !fullPageRoutes.includes(location.pathname);

  // If it's a full-page route (like onboarding), just render the outlet
  if (!shouldShowFullLayout) {
    return <Outlet />;
  }

  // Regular dashboard layout
  return (
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
        <Outlet />
      </main>
    </div>
  );
}
