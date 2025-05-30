import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  type CreateCompanyRequest,
  type CreateOrUpdateUserRequest,
  type SwitchCompanyRequest,
} from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

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
  return useQuery({
    queryKey: queryKeys.ping,
    queryFn: () => apiClient.ping(),
  });
};

export const useAuthTest = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.authTest,
    queryFn: () => apiClient.authTest(),
    enabled: !!token,
  });
};

// User hooks
export const useCreateOrUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrUpdateUserRequest) =>
      apiClient.createOrUpdateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
};

export const useCurrentUser = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated && !!token,
  });
};

export const useUserCompanies = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.userCompanies,
    queryFn: () => apiClient.getUserCompanies(),
    enabled: isAuthenticated && !!token,
  });
};

export const useSwitchCompany = () => {
  const queryClient = useQueryClient();

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
  const { token, isAuthenticated, user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.currentCompany,
    queryFn: () => apiClient.getCurrentCompany(),
    enabled: isAuthenticated && !!token && !!user?.hasActiveCompany,
  });
};

// Product hooks
export const useProducts = (params?: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: string;
}) => {
  const { token, isAuthenticated, user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => apiClient.getProducts(params),
    enabled: isAuthenticated && !!token && !!user?.hasActiveCompany,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
