import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface SubscriptionResponse {
  id: string;
  clerkOrganizationId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  planName: string;
  monthlyPrice: number;
  status: string;
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  isTrialActive: boolean;
  daysRemaining: number;
  isExpired: boolean;
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;
  maxWarehouses: number;
  hasAdvancedReporting: boolean;
  hasReporting: boolean;
  hasInvoicing: boolean;
  currentUsers: number;
  currentProducts: number;
  currentOrders: number;
  currentWarehouses: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  isPopular?: boolean;
  features: string[];
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;
  maxWarehouses: number;
  hasAdvancedReporting: boolean;
  hasReporting: boolean;
  hasInvoicing: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

export interface SubscriptionUsageResponse {
  currentUsers: number;
  currentProducts: number;
  currentOrders: number;
  currentWarehouses: number;
  limits: {
    maxUsers: number;
    maxProducts: number;
    maxOrders: number;
    maxWarehouses: number;
    hasAdvancedReporting: boolean;
    hasReporting: boolean;
    hasInvoicing: boolean;
  };
  usageMetrics: Record<
    string,
    {
      current: number;
      limit: number;
      percentageUsed: number;
      isAtLimit: boolean;
      isNearLimit: boolean;
    }
  >;
}

export interface CreateTrialSubscriptionRequest {
  planName?: string;
  trialDays?: number;
}

export interface CreatePaidSubscriptionRequest {
  planName: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  monthlyPrice: number;
  trialEndDate?: string;
}

// Updated DTOs to match backend
export interface SyncUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  imageUrl?: string;
}

export interface UserResponse {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  currentOrganizationId?: string;
  phone?: string;
  imageUrl?: string;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
}

export interface CompleteUserOnboardingRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: string;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: string;
}

export interface CompleteOrganizationSetupRequest {
  description?: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  businessRegistrationNumber?: string;
  defaultCurrency?: string;
  timeZone?: string;
  dateFormat?: string;
  multiLocationEnabled?: boolean;
}

export interface SyncOrganizationRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface OrganizationResponse {
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

export interface UpdateOrganizationRequest {
  description?: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  businessRegistrationNumber?: string;
  defaultCurrency?: string;
  timeZone?: string;
  dateFormat?: string;
  multiLocationEnabled?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unit?: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unit?: string;
  status: string;
  createdAt: string;
  createdBy?: string;
}

export interface ProductSearchRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: string;
  status?: string;
}

export interface PagedProductResponse {
  products: ProductResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  createdAt: string;
  createdBy?: string;
  subCategories: CategoryResponse[];
  productCount: number;
}

export interface CategorySearchRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  parentCategoryId?: string;
}

export interface PagedCategoryResponse {
  categories: CategoryResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

class ApiClient {
  private getToken: (() => Promise<string | null>) | null = null;

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    let token: string | null = null;

    if (this.getToken) {
      try {
        token = await this.getToken();
      } catch (error) {
        console.warn("Failed to get auth token:", error);
      }
    }

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...(await this.getAuthHeaders()),
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        }

        return response.text() as unknown as T;
      } catch (error: any) {
        // Check if it's a network error that might benefit from retry
        const isRetryableError =
          error.message.includes("ERR_INSUFFICIENT_RESOURCES") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("Network Error");

        if (isRetryableError && retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.warn(
            `Request failed, retrying in ${delay}ms... (${retryCount}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If not retryable or max retries reached, throw the error
        throw error;
      }
    }

    throw new Error("Max retries reached");
  }

  // Test endpoints
  async ping(): Promise<{ message: string; timestamp: string }> {
    return this.request("/test/ping");
  }

  async authTest(): Promise<any> {
    return this.request("/test/auth-test");
  }

  // User endpoints
  async syncUser(data: SyncUserRequest): Promise<UserResponse> {
    return this.request("/users/sync", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUserProfile(
    data: UpdateUserProfileRequest
  ): Promise<UserResponse> {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async completeUserOnboarding(
    data: CompleteUserOnboardingRequest
  ): Promise<UserResponse> {
    return this.request("/users/complete-onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request("/users/me");
  }

  // Organization endpoints
  async syncOrganization(
    data: SyncOrganizationRequest
  ): Promise<OrganizationResponse> {
    return this.request("/organizations/sync", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async completeOrganizationSetup(
    data: CompleteOrganizationSetupRequest
  ): Promise<OrganizationResponse> {
    return this.request("/organizations/complete-setup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(
    data: UpdateOrganizationRequest
  ): Promise<OrganizationResponse> {
    return this.request("/organizations/current", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getCurrentOrganization(): Promise<OrganizationResponse> {
    return this.request("/organizations/current");
  }

  // Product endpoints
  async getProducts(
    params?: ProductSearchRequest
  ): Promise<PagedProductResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.pageSize)
      searchParams.append("pageSize", params.pageSize.toString());
    if (params?.searchTerm)
      searchParams.append("searchTerm", params.searchTerm);
    if (params?.categoryId)
      searchParams.append("categoryId", params.categoryId);
    if (params?.status) searchParams.append("status", params.status);

    const queryString = searchParams.toString();
    return this.request(`/products${queryString ? `?${queryString}` : ""}`);
  }

  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProduct(id: string): Promise<ProductResponse> {
    return this.request(`/products/${id}`);
  }

  async updateProduct(
    id: string,
    data: Partial<CreateProductRequest>
  ): Promise<ProductResponse> {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async checkSkuAvailability(
    sku: string,
    excludeId?: string
  ): Promise<{ isAvailable: boolean; sku: string }> {
    const params = excludeId ? `?excludeId=${excludeId}` : "";
    return this.request(`/products/check-sku/${sku}${params}`);
  }

  // Category endpoints
  async getCategories(
    params?: CategorySearchRequest
  ): Promise<PagedCategoryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.pageSize)
      searchParams.append("pageSize", params.pageSize.toString());
    if (params?.searchTerm)
      searchParams.append("searchTerm", params.searchTerm);
    if (params?.parentCategoryId)
      searchParams.append("parentCategoryId", params.parentCategoryId);

    const queryString = searchParams.toString();
    return this.request(`/categories${queryString ? `?${queryString}` : ""}`);
  }

  async createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCategory(id: string): Promise<CategoryResponse> {
    return this.request(`/categories/${id}`);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse> {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  async getCategoryHierarchy(): Promise<CategoryResponse[]> {
    return this.request("/categories/hierarchy");
  }

  // Subscription endpoints

  async getCurrentSubscription(): Promise<SubscriptionResponse> {
    return this.request("/subscriptions/current");
  }

  async getAvailablePlans(): Promise<SubscriptionPlanResponse[]> {
    return this.request("/subscriptions/plans");
  }

  async getSubscriptionLimits(): Promise<{
    maxUsers: number;
    maxProducts: number;
    maxOrders: number;
    maxWarehouses: number;
    hasAdvancedReporting: boolean;
    hasReporting: boolean;
    hasInvoicing: boolean;
  }> {
    return this.request("/subscriptions/limits");
  }

  async getSubscriptionUsage(): Promise<SubscriptionUsageResponse> {
    return this.request("/subscriptions/usage");
  }

  async createTrialSubscription(
    data: CreateTrialSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    return this.request("/subscriptions/trial", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createPaidSubscription(
    data: CreatePaidSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    return this.request("/subscriptions/paid", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(
    id: string,
    data: {
      planName?: string;
      monthlyPrice?: number;
      status?: string;
      endDate?: string;
      maxUsers?: number;
      maxProducts?: number;
      maxOrders?: number;
      maxWarehouses?: number;
      hasAdvancedReporting?: boolean;
      hasReporting?: boolean;
      hasInvoicing?: boolean;
    }
  ): Promise<SubscriptionResponse> {
    return this.request(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async cancelSubscription(
    id: string,
    data: {
      cancellationReason?: string;
      cancelImmediately?: boolean;
    }
  ): Promise<void> {
    return this.request(`/subscriptions/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async reactivateSubscription(id: string): Promise<SubscriptionResponse> {
    return this.request(`/subscriptions/${id}/reactivate`, {
      method: "POST",
    });
  }

  async checkLimit(
    limitType: string,
    currentCount: number
  ): Promise<{ canAdd: boolean; limitType: string }> {
    return this.request("/subscriptions/check-limit", {
      method: "POST",
      body: JSON.stringify({ limitType, currentCount }),
    });
  }

  async createCheckoutSession(data: {
    priceId: string;
    customerId?: string;
    customerEmail: string;
    customerName: string;
    organizationName: string;
    successUrl: string;
    cancelUrl: string;
    isAnnual?: boolean;
    trialDays?: number;
  }): Promise<{
    sessionId: string;
    sessionUrl: string;
    customerId: string;
  }> {
    return this.request("/payments/create-checkout-session", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createPortalSession(data: {
    customerId: string;
    returnUrl: string;
  }): Promise<{
    sessionUrl: string;
  }> {
    return this.request("/payments/create-portal-session", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createStripeCustomer(data: {
    email: string;
    name: string;
    organizationName: string;
    metadata?: Record<string, string>;
  }): Promise<{
    customerId: string;
    email: string;
    name: string;
  }> {
    return this.request("/payments/create-customer", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStripePrices(): Promise<
    Array<{
      id: string;
      productId: string;
      productName: string;
      productDescription: string;
      unitAmount: number;
      currency: string;
      interval: string;
      intervalCount: number;
      isActive: boolean;
      metadata?: Record<string, string>;
    }>
  > {
    return this.request("/payments/prices");
  }

  async getStripeSubscription(subscriptionId: string): Promise<{
    id: string;
    customerId: string;
    status: string;
    priceId: string;
    amount: number;
    currency: string;
    interval: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialStart?: string;
    trialEnd?: string;
    cancelAt?: string;
    canceledAt?: string;
    createdAt: string;
    metadata?: Record<string, string>;
  }> {
    return this.request(`/payments/subscription/${subscriptionId}`);
  }

  async cancelStripeSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<{
    id: string;
    status: string;
  }> {
    return this.request(`/payments/subscription/${subscriptionId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ immediately }),
    });
  }

  async updateStripeSubscription(
    subscriptionId: string,
    data: {
      priceId?: string;
      prorationBehavior?: boolean;
      metadata?: Record<string, string>;
    }
  ): Promise<{
    id: string;
    status: string;
  }> {
    return this.request(`/payments/subscription/${subscriptionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Plan Management endpoints
  async changePlan(data: {
    newPlanId: string;
    effectiveDate?: string;
    prorationBehavior?: string;
  }): Promise<SubscriptionResponse> {
    return this.request("/subscriptions/change-plan", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async upgradeToProPlan(
    isAnnual: boolean = false
  ): Promise<SubscriptionResponse> {
    return this.request("/subscriptions/upgrade-to-pro", {
      method: "POST",
      body: JSON.stringify({ isAnnual }),
    });
  }

  async downgradeToStarter(): Promise<SubscriptionResponse> {
    return this.request("/subscriptions/downgrade-to-starter", {
      method: "POST",
    });
  }

  async canChangeToPlan(
    planId: string
  ): Promise<{ canChange: boolean; planId: string }> {
    return this.request(`/subscriptions/can-change-to/${planId}`);
  }

  async getUpgradeRecommendations(): Promise<string[]> {
    return this.request("/subscriptions/upgrade-recommendations");
  }
}

export const apiClient = new ApiClient();

// Hook to initialize API client with Clerk token
export function useApiClient() {
  const { getToken } = useAuth();

  // Set the token getter on the API client
  apiClient.setTokenGetter(getToken);

  return apiClient;
}
