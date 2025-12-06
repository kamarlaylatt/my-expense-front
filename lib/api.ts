import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
  User,
  Category,
  Currency,
  Expense,
  ExpenseSummary,
  ApiResponse,
  PaginatedResponse,
  Pagination,
  LoginCredentials,
  SignupCredentials,
  CreateExpense,
  UpdateExpense,
  CreateCategory,
  UpdateCategory,
  CreateCurrency,
  UpdateCurrency,
  ExpenseFilters,
  CurrencyTotal,
  GoogleOAuthCredentials,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Custom error class to hold API error details
export class ApiError extends Error {
  status: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(message: string, status: number, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// Helper function to extract error message from API response
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // If there are field-specific errors, format them
    if (error.errors && error.errors.length > 0) {
      return error.errors.map(e => `${e.field}: ${e.message}`).join(", ");
    }
    return error.message;
  }
  
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiResponse<unknown> | undefined;
    
    // Check for API error response format
    if (responseData?.message) {
      return responseData.message;
    }
    
    // Check for validation errors
    if (responseData?.errors && responseData.errors.length > 0) {
      return responseData.errors.map(e => `${e.field}: ${e.message}`).join(", ");
    }
    
    // Handle common HTTP status codes
    switch (error.response?.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Session expired. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This resource already exists.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred.";
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Check if the response indicates failure even with 2xx status
    const data = response.data as ApiResponse<unknown>;
    if (data && data.success === false) {
      throw new ApiError(
        data.message || "Request failed",
        response.status,
        data.errors
      );
    }
    return response;
  },
  (error: AxiosError) => {
    const responseData = error.response?.data as ApiResponse<unknown> | undefined;
    
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    
    // Create a more descriptive error
    const message = responseData?.message || getErrorMessage(error);
    const apiError = new ApiError(
      message,
      error.response?.status || 500,
      responseData?.errors
    );
    
    return Promise.reject(apiError);
  }
);

// Auth API
export const authApi = {
  signup: async (credentials: SignupCredentials): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>("/api/auth/signup", credentials);
    return response.data;
  },

  signin: async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>("/api/auth/signin", credentials);
    return response.data;
  },

  googleAuth: async (
    payload: GoogleOAuthCredentials
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>("/api/auth/google", payload);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>("/api/auth/profile");
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<{ categories: Category[] }>> => {
    const response = await api.get<ApiResponse<{ categories: Category[] }>>("/api/categories");
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<{ category: Category }>> => {
    const response = await api.get<ApiResponse<{ category: Category }>>(`/api/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategory): Promise<ApiResponse<{ category: Category }>> => {
    const response = await api.post<ApiResponse<{ category: Category }>>("/api/categories", data);
    return response.data;
  },

  update: async (id: number, data: UpdateCategory): Promise<ApiResponse<{ category: Category }>> => {
    const response = await api.put<ApiResponse<{ category: Category }>>(`/api/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/categories/${id}`);
    return response.data;
  },
};

// Currencies API
export const currenciesApi = {
  getAll: async (): Promise<ApiResponse<{ currencies: Currency[] }>> => {
    const response = await api.get<ApiResponse<{ currencies: Currency[] }>>("/api/currencies");
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<{ currency: Currency }>> => {
    const response = await api.get<ApiResponse<{ currency: Currency }>>(`/api/currencies/${id}`);
    return response.data;
  },

  create: async (data: CreateCurrency): Promise<ApiResponse<{ currency: Currency }>> => {
    const response = await api.post<ApiResponse<{ currency: Currency }>>("/api/currencies", data);
    return response.data;
  },

  update: async (id: number, data: UpdateCurrency): Promise<ApiResponse<{ currency: Currency }>> => {
    const response = await api.put<ApiResponse<{ currency: Currency }>>(`/api/currencies/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/currencies/${id}`);
    return response.data;
  },
};

// Expenses API
export const expensesApi = {
  getAll: async (filters?: ExpenseFilters): Promise<ApiResponse<{ expenses: Expense[]; totalsByCurrency: CurrencyTotal[] }> & { pagination?: Pagination }> => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append("categoryId", String(filters.categoryId));
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    
    const response = await api.get<ApiResponse<{ expenses: Expense[]; totalsByCurrency: CurrencyTotal[] }> & { pagination?: Pagination }>(`/api/expenses?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<{ expense: Expense }>> => {
    const response = await api.get<ApiResponse<{ expense: Expense }>>(`/api/expenses/${id}`);
    return response.data;
  },

  getSummary: async (startDate?: string, endDate?: string): Promise<ApiResponse<{ summary: ExpenseSummary }>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const response = await api.get<ApiResponse<{ summary: ExpenseSummary }>>(`/api/expenses/summary?${params.toString()}`);
    return response.data;
  },

  create: async (data: CreateExpense): Promise<ApiResponse<{ expense: Expense }>> => {
    const response = await api.post<ApiResponse<{ expense: Expense }>>("/api/expenses", data);
    return response.data;
  },

  update: async (id: number, data: UpdateExpense): Promise<ApiResponse<{ expense: Expense }>> => {
    const response = await api.put<ApiResponse<{ expense: Expense }>>(`/api/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/expenses/${id}`);
    return response.data;
  },
};

export default api;
