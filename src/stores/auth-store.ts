import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  fullName: string
  hasActiveCompany: boolean
  currentCompanyId?: string
  currentCompanyName?: string
}

export interface Company {
  id: string
  name: string
  role: string
  isActive: boolean
  joinedAt: string
}

interface AuthState {
  // Auth status
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  lastInitializedEmail: string | null
  
  // User data
  user: User | null
  token: string | null
  companies: Company[]
  
  // Actions
  setUser: (user: User, token: string) => void
  updateUserCompany: (companyId?: string, companyName?: string) => void
  setCompanies: (companies: Company[]) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean, email?: string) => void
  clearAuth: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      lastInitializedEmail: null,
      user: null,
      token: null,
      companies: [],

      // Actions
      setUser: (user: User, token: string) => {
        set({
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
          isInitialized: true,
          lastInitializedEmail: user.email,
        })
      },

      updateUserCompany: (companyId?: string, companyName?: string) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              currentCompanyId: companyId,
              currentCompanyName: companyName,
              hasActiveCompany: !!companyId,
            },
          })
        }
      },

      setCompanies: (companies: Company[]) => {
        set({ companies })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setInitialized: (initialized: boolean, email?: string) => {
        set({
          isInitialized: initialized,
          lastInitializedEmail: email || null,
        })
      },

      clearAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          companies: [],
          isLoading: false,
          isInitialized: false,
          lastInitializedEmail: null,
        })
      },

      logout: () => {
        // Clear auth state
        get().clearAuth()
        
        // Redirect to Kinde logout
        window.location.href = '/api/auth/logout'
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        companies: state.companies,
        isInitialized: state.isInitialized,
        lastInitializedEmail: state.lastInitializedEmail,
      }),
    }
  )
)