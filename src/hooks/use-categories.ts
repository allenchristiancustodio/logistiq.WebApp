import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  apiClient,
  useApiClient,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type CategorySearchRequest,
} from "@/lib/api-client";
import { useCurrentOrgId } from "./use-auth-api";

// Query keys for category-related queries
export const categoryQueryKeys = {
  categories: (orgId?: string, params?: CategorySearchRequest) =>
    ["categories", orgId, params] as const,
  category: (orgId?: string, id?: string) => ["category", orgId, id] as const,
  categoryHierarchy: (orgId?: string) => ["category-hierarchy", orgId] as const,
};

// Category query hooks
export const useCategories = (params?: CategorySearchRequest) => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: categoryQueryKeys.categories(orgId, params),
    queryFn: () => apiClient.getCategories(params),
    enabled: isSignedIn && !!orgId,
  });
};

export const useCategory = (id: string) => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: categoryQueryKeys.category(orgId, id),
    queryFn: () => apiClient.getCategory(id),
    enabled: isSignedIn && !!id && !!orgId,
  });
};

export const useCategoryHierarchy = () => {
  const { isSignedIn } = useAuth();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useQuery({
    queryKey: categoryQueryKeys.categoryHierarchy(orgId),
    queryFn: () => apiClient.getCategoryHierarchy(),
    enabled: isSignedIn && !!orgId,
  });
};

// Category mutation hooks
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => apiClient.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.categories(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.categoryHierarchy(orgId),
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      apiClient.updateCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.categories(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.category(orgId, variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.categoryHierarchy(orgId),
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  useApiClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.categories(orgId),
      });
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.categoryHierarchy(orgId),
      });
    },
  });
};
