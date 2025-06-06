// src/stores/auth-store.ts - Simplified for Clerk
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  currentOrganizationId?: string;
  phone?: string;
  preferences?: string;
  imageUrl?: string;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
}

export interface Organization {
  id: string;
  clerkOrganizationId: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  hasCompletedSetup: boolean;
}

interface AuthState {
  // Synced user data from backend
  user: User | null;
  organization: Organization | null;

  // Actions
  setUser: (user: User | null) => void;
  setOrganization: (organization: Organization | null) => void;
  clearData: () => void;
  clearOrganizationData: () => void;

  // Helper getters
  isUserSynced: () => boolean;
  isOrganizationSynced: () => boolean;
  hasCompleteSetup: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      organization: null,

      // Actions
      setUser: (user: User | null) => {
        console.log("Setting user in store:", user?.email);
        set({ user });
      },

      setOrganization: (organization: Organization | null) => {
        console.log("Setting organization in store:", organization?.name);
        set({ organization });
      },

      clearData: () => {
        console.log("Clearing auth data (org switch or logout)");
        set({
          user: null,
          organization: null,
        });
      },

      clearOrganizationData: () => {
        console.log("Clearing organization data for org switch");
        set({ organization: null });
      },

      // Helper getters
      isUserSynced: () => {
        return !!get().user;
      },

      isOrganizationSynced: () => {
        return !!get().organization;
      },

      hasCompleteSetup: () => {
        const { user, organization } = get();
        return !!user && !!organization;
      },
    }),
    {
      name: "logistiq-auth-clerk", // New name to reset old data
      version: 3, // Increment to clear old data
    }
  )
);
