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
import { expensesApi, categoriesApi, currenciesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseSummary, Expense, Category, Currency } from "@/types";
import { Wallet, Receipt, Plus, ArrowRight, FolderOpen, Clock, Coins } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, expensesRes, categoriesRes, currenciesRes] = await Promise.all([
        expensesApi.getSummary(),
        expensesApi.getAll({ limit: 5 }),
        categoriesApi.getAll(),
        currenciesApi.getAll(),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data.summary);
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
        const categoriesData = categoriesRes.data.categories || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
      if (currenciesRes.success && currenciesRes.data) {
        const currenciesData = currenciesRes.data.currencies || [];
        setCurrencies(Array.isArray(currenciesData) ? currenciesData : []);
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
    currencyId: number;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await expensesApi.create({
        amount: data.amount,
        description: data.description,
        date: data.date?.toISOString(),
        categoryId: data.categoryId,
        currencyId: data.currencyId,
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

  // Format totals by currency for display
  const formatTotalsByCurrency = () => {
    if (!summary?.totalsByCurrency || summary.totalsByCurrency.length === 0) {
      return "$0.00";
    }
    return summary.totalsByCurrency
      .map((t) => formatCurrency(t.totalAmount, t.currency.name))
      .join(" • ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here&apos;s your expense overview.
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

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-fade-in">
          <SummaryCard
            title="Total Expenses"
            value={formatTotalsByCurrency()}
            description="All time total"
            icon={Wallet}
            loading={isLoading}
            variant="primary"
          />
          <SummaryCard
            title="Total Transactions"
            value={summary?.totalCount?.toString() || "0"}
            description="Number of expenses"
            icon={Receipt}
            loading={isLoading}
            variant="success"
          />
          <SummaryCard
            title="Categories"
            value={(categories?.length || 0).toString()}
            description="Active categories"
            icon={FolderOpen}
            loading={isLoading}
            variant="warning"
          />
          <SummaryCard
            title="Currencies"
            value={(currencies?.length || 0).toString()}
            description="Active currencies"
            icon={Coins}
            loading={isLoading}
            variant="default"
          />
        </div>

        {/* Currency Breakdown Cards */}
        {summary?.totalsByCurrency && summary.totalsByCurrency.length > 1 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summary.totalsByCurrency.map((currencyTotal) => (
              <Card key={currencyTotal.currency.id} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{currencyTotal.currency.name}</span>
                    </div>
                    <span className="text-lg font-bold">
                      {formatCurrency(currencyTotal.totalAmount, currencyTotal.currency.name)}
                    </span>
                  </div>
                  {currencyTotal.count !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {currencyTotal.count} transaction{currencyTotal.count !== 1 ? "s" : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <CategoryBreakdown
            data={summary?.totalByCategory || []}
            loading={isLoading}
          />

          {/* Recent Expenses */}
          <Card className="border-0 shadow-lg hover-lift overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Recent Expenses</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="rounded-lg">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Expense</DialogTitle>
            <DialogDescription>
              Create a new expense record. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            categories={categories}
            currencies={currencies}
            onSubmit={handleCreateExpense}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
