import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface CreateOrUpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UserResult {
  userId: string;
  email: string;
  fullName: string;
  isNewUser: boolean;
  hasActiveCompany: boolean;
  currentCompanyId?: string;
  currentCompanyName?: string;
}

export interface CreateCompanyRequest {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface CompanyResult {
  id: string;
  name: string;
  isOwner: boolean;
}

export interface UserCompany {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
}

export interface SwitchCompanyRequest {
  companyId: string;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
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

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
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
  }

  // Test endpoints
  async ping(): Promise<{ message: string; timestamp: string }> {
    return this.request("/test/ping");
  }

  async authTest(): Promise<any> {
    return this.request("/test/auth-test");
  }

  // User endpoints
  async createOrUpdateUser(
    data: CreateOrUpdateUserRequest
  ): Promise<UserResult> {
    return this.request("/users/create-or-update", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<UserResult> {
    return this.request("/users/me");
  }

  async getUserCompanies(): Promise<UserCompany[]> {
    return this.request("/users/companies");
  }

  async switchCompany(data: SwitchCompanyRequest): Promise<UserResult> {
    return this.request("/users/switch-company", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Company endpoints
  async createCompany(data: CreateCompanyRequest): Promise<CompanyResult> {
    return this.request("/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentCompany(): Promise<any> {
    return this.request("/companies/current");
  }

  // Products endpoints
  async getProducts(params?: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    categoryId?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.pageSize)
      searchParams.append("pageSize", params.pageSize.toString());
    if (params?.searchTerm)
      searchParams.append("searchTerm", params.searchTerm);
    if (params?.categoryId)
      searchParams.append("categoryId", params.categoryId);

    const queryString = searchParams.toString();
    return this.request(`/products${queryString ? `?${queryString}` : ""}`);
  }

  async createProduct(data: any): Promise<any> {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
