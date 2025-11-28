export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  _count?: { expenses: number };
}

export interface Expense {
  id: number;
  amount: number;
  description?: string;
  date: string;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    color?: string;
  };
}

export interface ExpenseSummary {
  totalAmount: number;
  totalCount: number;
  byCategory: Array<{
    category: { id: number; name: string; color?: string };
    totalAmount: number;
    count: number;
  }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: Pagination;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface CreateExpense {
  amount: number;
  description?: string;
  date?: string;
  categoryId: number;
}

export interface UpdateExpense {
  amount?: number;
  description?: string;
  date?: string;
  categoryId?: number;
}

export interface CreateCategory {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategory {
  name?: string;
  description?: string;
  color?: string;
}

export interface ExpenseFilters {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
