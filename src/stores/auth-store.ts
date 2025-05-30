import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  fullName: string;
  hasActiveCompany: boolean;
  currentCompanyId?: string;
  currentCompanyName?: string;
}

export interface Company {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
}

interface AuthState {
  // Company-specific state (Clerk handles user state)
  user: User | null;
  companies: Company[];
  hasActiveCompany: boolean;
  currentCompanyId?: string;
  currentCompanyName?: string;

  // Actions
  setUser: (user: User) => void;
  updateUserCompany: (companyId?: string, companyName?: string) => void;
  setCompanies: (companies: Company[]) => void;
  clearCompanyData: () => void;

  // Helper getters
  needsOnboarding: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      companies: [],
      hasActiveCompany: false,
      currentCompanyId: undefined,
      currentCompanyName: undefined,

      // Actions
      setUser: (user: User) => {
        console.log("🔄 Setting user in store:", user.email);
        set({
          user,
          hasActiveCompany: user.hasActiveCompany,
          currentCompanyId: user.currentCompanyId,
          currentCompanyName: user.currentCompanyName,
        });
      },

      updateUserCompany: (companyId?: string, companyName?: string) => {
        const currentUser = get().user;
        if (currentUser) {
          console.log("🔄 Updating user company:", { companyId, companyName });
          const updatedUser = {
            ...currentUser,
            currentCompanyId: companyId,
            currentCompanyName: companyName,
            hasActiveCompany: !!companyId,
          };
          set({
            user: updatedUser,
            hasActiveCompany: !!companyId,
            currentCompanyId: companyId,
            currentCompanyName: companyName,
          });
        }
      },

      setCompanies: (companies: Company[]) => {
        set({ companies });
      },

      clearCompanyData: () => {
        console.log("🧹 Clearing company data");
        set({
          user: null,
          companies: [],
          hasActiveCompany: false,
          currentCompanyId: undefined,
          currentCompanyName: undefined,
        });
      },

      // Helper getters
      needsOnboarding: () => {
        const user = get().user;
        return user ? !user.hasActiveCompany : false;
      },
    }),
    {
      name: "logistiq-auth-v2", // Changed name to reset old Kinde data
      version: 2, // Increment version to clear old data
    }
  )
);
