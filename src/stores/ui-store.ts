import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isDarkMode: false,

      toggleSidebar: () => {
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ isSidebarCollapsed: collapsed });
      },

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      setDarkMode: (darkMode: boolean) => {
        set({ isDarkMode: darkMode });
      },
    }),
    {
      name: "ui-storage",
    }
  )
);
