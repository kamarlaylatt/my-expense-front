"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { expensesApi, categoriesApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Expense, Category, Pagination } from "@/types";
import { Plus, CalendarIcon, ChevronLeft, ChevronRight, X, Filter, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();

  const hasActiveFilters = categoryFilter || startDate || endDate;

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await expensesApi.getAll({
        categoryId:
          categoryFilter && categoryFilter !== "all"
            ? parseInt(categoryFilter)
            : undefined,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        page: currentPage,
        limit: 10,
      });
      if (response.success && response.data) {
        const expensesData = response.data.expenses || [];
        const normalizedExpenses = expensesData.map((e) => ({
          ...e,
          amount: typeof e.amount === "string" ? parseFloat(e.amount) : e.amount,
        }));
        setExpenses(normalizedExpenses);
        setPagination(response.pagination || null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
      console.error("Failed to fetch expenses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, startDate, endDate, currentPage, toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getAll();
      if (response.success && response.data) {
        const categoriesData = response.data.categories || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleCreateOrUpdateExpense = async (data: {
    amount: number;
    description?: string;
    date?: Date;
    categoryId: number;
  }) => {
    setIsSubmitting(true);
    try {
      let response;
      if (editingExpense) {
        response = await expensesApi.update(editingExpense.id, {
          amount: data.amount,
          description: data.description,
          date: data.date?.toISOString(),
          categoryId: data.categoryId,
        });
      } else {
        response = await expensesApi.create({
          amount: data.amount,
          description: data.description,
          date: data.date?.toISOString(),
          categoryId: data.categoryId,
        });
      }

      if (response.success) {
        toast({
          title: "Success",
          description: editingExpense
            ? "Expense updated successfully"
            : "Expense created successfully",
        });
        setIsDialogOpen(false);
        setEditingExpense(null);
        fetchExpenses();
      } else {
        throw new Error(response.message || "Failed to save expense");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpense) return;

    try {
      const response = await expensesApi.delete(deleteExpense.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Expense deleted successfully",
        });
        setDeleteExpense(null);
        fetchExpenses();
      } else {
        throw new Error(response.message || "Failed to delete expense");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeleteExpense(expense);
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const setQuickRange = (range: "today" | "oneweek" | "onemonth" | "oneyear") => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);
    if (range === "today") {
      // start remains today
    } else if (range === "oneweek") {
      start.setDate(start.getDate() - 7);
    } else if (range === "onemonth") {
      start.setMonth(start.getMonth() - 1);
    } else if (range === "oneyear") {
      start.setFullYear(start.getFullYear() - 1);
    }
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your expenses
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="rounded-xl h-11 px-5 shadow-lg shadow-primary/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="rounded-full ml-2">
                  Active
                </Badge>
              )}
            </div>
            <div className="space-y-4">
              {/* Row 1: Quick Range Buttons + Category */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Range</label>
                  <div className="flex gap-2">
                    <Button
                      variant={(startDate && endDate && format(startDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && format(endDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) ? "default" : "outline"}
                      className="h-10 rounded-lg"
                      onClick={() => setQuickRange("today")}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-lg"
                      onClick={() => setQuickRange("oneweek")}
                    >
                      One Week
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-lg"
                      onClick={() => setQuickRange("onemonth")}
                    >
                      One Month
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-lg"
                      onClick={() => setQuickRange("oneyear")}
                    >
                      One Year
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px] h-10 rounded-lg">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {Array.isArray(categories) && categories.map((category) => (
                        <SelectItem key={category.id} value={category.id?.toString() || ""}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: category.color || "#888888" }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Start Date + End Date + Clear filters */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 sm:flex sm:items-center sm:gap-2 sm:space-y-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider sm:whitespace-nowrap sm:mr-2">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left font-normal h-10 rounded-lg",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="min-w-[280px] p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 sm:flex sm:items-center sm:gap-2 sm:space-y-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider sm:whitespace-nowrap sm:mr-2">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left font-normal h-10 rounded-lg",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="min-w-[280px] p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters}
                    className="h-10 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <ExpenseTable
          expenses={expenses}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Showing page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
              <span className="font-medium text-foreground">{pagination.totalPages}</span>
              {" "}• {pagination.total} total expenses
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="rounded-lg"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Expense Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingExpense(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
            <DialogDescription>
              {editingExpense
                ? "Update the expense details below."
                : "Create a new expense record. Fill in the details below."}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense || undefined}
            categories={categories}
            onSubmit={handleCreateOrUpdateExpense}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingExpense(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteExpense} onOpenChange={() => setDeleteExpense(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Receipt className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Expense</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this expense? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteExpense(null)}
              className="rounded-xl min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteExpense}
              className="rounded-xl min-w-[100px]"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
