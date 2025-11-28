import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
  User,
  Category,
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
  ExpenseFilters,
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

  getById: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await api.get<ApiResponse<Category>>(`/api/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategory): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>("/api/categories", data);
    return response.data;
  },

  update: async (id: number, data: UpdateCategory): Promise<ApiResponse<Category>> => {
    const response = await api.put<ApiResponse<Category>>(`/api/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/categories/${id}`);
    return response.data;
  },
};

// Expenses API
export const expensesApi = {
  getAll: async (filters?: ExpenseFilters): Promise<ApiResponse<{ expenses: Expense[] }> & { pagination?: Pagination }> => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append("categoryId", String(filters.categoryId));
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    
    const response = await api.get<ApiResponse<{ expenses: Expense[] }> & { pagination?: Pagination }>(`/api/expenses?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Expense>> => {
    const response = await api.get<ApiResponse<Expense>>(`/api/expenses/${id}`);
    return response.data;
  },

  getSummary: async (startDate?: string, endDate?: string): Promise<ApiResponse<ExpenseSummary>> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const response = await api.get<ApiResponse<ExpenseSummary>>(`/api/expenses/summary?${params.toString()}`);
    return response.data;
  },

  create: async (data: CreateExpense): Promise<ApiResponse<Expense>> => {
    const response = await api.post<ApiResponse<Expense>>("/api/expenses", data);
    return response.data;
  },

  update: async (id: number, data: UpdateExpense): Promise<ApiResponse<Expense>> => {
    const response = await api.put<ApiResponse<Expense>>(`/api/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/expenses/${id}`);
    return response.data;
  },
};

export default api;
