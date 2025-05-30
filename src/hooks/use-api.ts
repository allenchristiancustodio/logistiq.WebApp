// src/hooks/use-api.ts - Updated for Clerk
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  apiClient,
  useApiClient,
  type CreateCompanyRequest,
  type CreateOrUpdateUserRequest,
  type SwitchCompanyRequest,
} from "@/lib/api-client";

// Query keys
export const queryKeys = {
  user: ["user"] as const,
  userCompanies: ["user", "companies"] as const,
  currentCompany: ["company", "current"] as const,
  products: (params?: any) => ["products", params] as const,
  ping: ["ping"] as const,
  authTest: ["auth-test"] as const,
};

// Test hooks
export const usePing = () => {
  useApiClient(); // Initialize API client
  return useQuery({
    queryKey: queryKeys.ping,
    queryFn: () => apiClient.ping(),
  });
};

export const useAuthTest = () => {
  const { isSignedIn } = useAuth();
  useApiClient(); // Initialize API client

  return useQuery({
    queryKey: queryKeys.authTest,
    queryFn: () => apiClient.authTest(),
    enabled: isSignedIn,
  });
};

// User hooks
export const useCreateOrUpdateUser = () => {
  const queryClient = useQueryClient();
  useApiClient(); // Initialize API client

  return useMutation({
    mutationFn: (data: CreateOrUpdateUserRequest) =>
      apiClient.createOrUpdateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
};

export const useCurrentUser = () => {
  const { isSignedIn } = useAuth();
  useApiClient(); // Initialize API client

  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isSignedIn,
  });
};

export const useUserCompanies = () => {
  const { isSignedIn } = useAuth();
  useApiClient(); // Initialize API client

  return useQuery({
    queryKey: queryKeys.userCompanies,
    queryFn: () => apiClient.getUserCompanies(),
    enabled: isSignedIn,
  });
};

export const useSwitchCompany = () => {
  const queryClient = useQueryClient();
  useApiClient(); // Initialize API client

  return useMutation({
    mutationFn: (data: SwitchCompanyRequest) => apiClient.switchCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.userCompanies });
      queryClient.invalidateQueries({ queryKey: queryKeys.currentCompany });
    },
  });
};

// Company hooks
export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  useApiClient(); // Initialize API client

  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => apiClient.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.userCompanies });
      queryClient.invalidateQueries({ queryKey: queryKeys.currentCompany });
    },
  });
};

export const useCurrentCompany = () => {
  const { isSignedIn } = useAuth();
  useApiClient(); // Initialize API client

  return useQuery({
    queryKey: queryKeys.currentCompany,
    queryFn: () => apiClient.getCurrentCompany(),
    enabled: isSignedIn,
  });
};

// Product hooks
export const useProducts = (params?: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: string;
}) => {
  const { isSignedIn } = useAuth();
  useApiClient(); // Initialize API client

  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => apiClient.getProducts(params),
    enabled: isSignedIn,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  useApiClient(); // Initialize API client

  return useMutation({
    mutationFn: (data: any) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
