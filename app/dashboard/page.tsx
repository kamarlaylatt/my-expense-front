"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { expensesApi, categoriesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseSummary, Expense, Category } from "@/types";
import { DollarSign, Receipt, Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, expensesRes, categoriesRes] = await Promise.all([
        expensesApi.getSummary(),
        expensesApi.getAll({ limit: 5 }),
        categoriesApi.getAll(),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (expensesRes.success && expensesRes.data) {
        const recent = expensesRes.data.expenses || [];
        const normalized = Array.isArray(recent)
          ? recent.map((e) => ({
              ...e,
              amount:
                typeof e.amount === "string" ? parseFloat(e.amount) : e.amount,
            }))
          : [];
        setRecentExpenses(normalized);
      }
      if (categoriesRes.success && categoriesRes.data) {
        // Handle nested categories array
        const categoriesData = categoriesRes.data.categories || categoriesRes.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateExpense = async (data: {
    amount: number;
    description?: string;
    date?: Date;
    categoryId: number;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await expensesApi.create({
        amount: data.amount,
        description: data.description,
        date: data.date?.toISOString(),
        categoryId: data.categoryId,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Expense created successfully",
        });
        setIsDialogOpen(false);
        fetchData();
      } else {
        throw new Error(response.message || "Failed to create expense");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Total Expenses"
            value={summary?.totalAmount ? formatCurrency(summary.totalAmount) : "$0.00"}
            description="All time total"
            icon={DollarSign}
            loading={isLoading}
          />
          <SummaryCard
            title="Total Transactions"
            value={summary?.totalCount?.toString() || "0"}
            description="Number of expenses"
            icon={Receipt}
            loading={isLoading}
          />
          <SummaryCard
            title="Categories"
            value={(categories?.length || 0).toString()}
            description="Active categories"
            icon={Receipt}
            loading={isLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <CategoryBreakdown
            data={summary?.byCategory || []}
            loading={isLoading}
          />

          {/* Recent Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Expenses</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/expenses">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ExpenseTable
                expenses={recentExpenses}
                loading={isLoading}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Create a new expense record.
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            categories={categories}
            onSubmit={handleCreateExpense}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
