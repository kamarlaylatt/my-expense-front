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
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
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
