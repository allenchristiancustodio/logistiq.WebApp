import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth as useClerkAuth, useOrganization } from "@clerk/clerk-react";
import {
  apiClient,
  useApiClient,
  type SyncUserRequest,
  type SyncOrganizationRequest,
  type UpdateUserProfileRequest,
  type UpdateOrganizationRequest,
  type CompleteUserOnboardingRequest,
  type CompleteOrganizationSetupRequest,
} from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

// Custom auth hook that wraps the auth store and Clerk auth
export const useAuth = () => {
  const { user, clearData } = useAuthStore();
  const { signOut } = useClerkAuth();

  const logout = async () => {
    clearData(); // Clear local store data
    await signOut(); // Sign out from Clerk
  };

  return { user, logout };
};

// Query keys for auth-related queries
export const authQueryKeys = {
  user: ["user"] as const,
  currentOrganization: (orgId?: string) =>
    ["organization", "current", orgId] as const,
  ping: ["ping"] as const,
  authTest: ["auth-test"] as const,
};

// Helper hook to get current organization ID
export const useCurrentOrgId = () => {
  const { organization } = useOrganization();
  return organization?.id;
};

// Test hooks
export const usePing = () => {
  useApiClient();
  return useQuery({
    queryKey: authQueryKeys.ping,
    queryFn: () => apiClient.ping(),
  });
};

export const useAuthTest = () => {
  const { isSignedIn } = useClerkAuth();
  useApiClient();

  return useQuery({
    queryKey: authQueryKeys.authTest,
    queryFn: () => apiClient.authTest(),
    enabled: isSignedIn,
  });
};

// User hooks
export const useSyncUser = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (data: SyncUserRequest) => apiClient.syncUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
  });
};

export const useCompleteUserOnboarding = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (data: CompleteUserOnboardingRequest) =>
      apiClient.completeUserOnboarding(data),
    onSuccess: (user) => {
      const { setUser } = useAuthStore.getState();
      setUser(user);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  useApiClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      apiClient.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
  });
};

export const useCurrentUser = () => {
  const { isSignedIn } = useClerkAuth();
  useApiClient();

  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isSignedIn,
    retry: false,
  });
};

// Organization hooks with cache isolation
export const useSyncOrganization = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: SyncOrganizationRequest) =>
      apiClient.syncOrganization(data),
    onSuccess: () => {
      // Invalidate for current organization
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentOrganization(orgId),
      });
    },
  });
};

export const useCompleteOrganizationSetup = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: CompleteOrganizationSetupRequest) =>
      apiClient.completeOrganizationSetup(data),
    onSuccess: (organization) => {
      const { setOrganization } = useAuthStore.getState();
      setOrganization(organization);

      queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentOrganization(orgId),
      });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) =>
      apiClient.updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentOrganization(orgId),
      });
    },
  });
};

export const useCurrentOrganization = () => {
  const { isSignedIn } = useClerkAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: authQueryKeys.currentOrganization(orgId),
    queryFn: () => apiClient.getCurrentOrganization(),
    enabled: isSignedIn && !!orgId,
    retry: false,
  });
};

export const useClearOrganizationCache = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();

  return useMutation({
    mutationFn: async () => {
      // This is a client-side only operation
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all organization-specific caches
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentOrganization(orgId),
      });

      // Clear all other organization-specific queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey.includes(orgId),
      });
    },
  });
};
