"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { expensesApi, categoriesApi, currenciesApi, getErrorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import type { ExpenseSummary, Expense, Category, Currency } from "@/types";
import { Wallet, Receipt, Plus, ArrowRight, FolderOpen, Clock, Coins, CalendarIcon, X } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Format dates for API (YYYY-MM-DD format)
      const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
      const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;

      const [summaryRes, expensesRes, categoriesRes, currenciesRes] = await Promise.all([
        expensesApi.getSummary(startDate, endDate),
        expensesApi.getAll({ limit: 5, startDate, endDate }),
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
        description: getErrorMessage(error),
        variant: "destructive",
      });
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, toast]);

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
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
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
    // Compute USD total based on exchange rates (using heuristic for direction)
    const usdTotal = summary.totalsByCurrency.reduce((sum, t) => {
      const amount = typeof t.totalAmount === "string" ? parseFloat(t.totalAmount) : Number(t.totalAmount as unknown as number);
      const rateRaw = t.currency.usdExchangeRate;
      const rate = typeof rateRaw === "string" ? parseFloat(rateRaw) : Number(rateRaw);
      if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) {
        return sum;
      }
      const usd = rate >= 10 ? amount / rate : amount * rate;
      return sum + usd;
    }, 0);

    // Show only the USD total in the SummaryCard value
    return formatCurrency(usdTotal);
  };

  // Get description based on date range
  const getDateRangeDescription = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    if (dateRange?.from) {
      return `From ${format(dateRange.from, "MMM d, yyyy")}`;
    }
    if (dateRange?.to) {
      return `Until ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    return "All time total";
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal rounded-xl h-11 px-4 min-w-[140px]",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      format(dateRange.from, "LLL dd, y")
                    ) : (
                      <span>Start Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(date) => date ? setDateRange({ from: date, to: dateRange?.to }) : setDateRange(undefined)}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">-</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal rounded-xl h-11 px-4 min-w-[140px]",
                      !dateRange?.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.to ? (
                      format(dateRange.to, "LLL dd, y")
                    ) : (
                      <span>End Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange?.to}
                    onSelect={(date) => date ? setDateRange({ from: dateRange?.from ?? date, to: date }) : setDateRange(dateRange?.from ? { from: dateRange.from, to: undefined } : undefined)}
                    disabled={(date) => dateRange?.from ? date < dateRange.from : false}
                  />
                </PopoverContent>
              </Popover>
              {(dateRange?.from || dateRange?.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-xl"
                  onClick={() => setDateRange(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="rounded-xl h-11 px-5 shadow-lg shadow-primary/25"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 stagger-fade-in">
          <SummaryCard
            title="Total Expenses"
            value={formatTotalsByCurrency()}
            description={getDateRangeDescription()}
            icon={Wallet}
            loading={isLoading}
            variant="primary"
          />
          <SummaryCard
            title="Total Transactions"
            value={summary?.totalCount?.toString() || "0"}
            description={getDateRangeDescription()}
            icon={Receipt}
            loading={isLoading}
            variant="success"
          />
        </div>

        {/* Currency Breakdown Cards */}
        {summary?.totalsByCurrency && summary.totalsByCurrency.length > 1 && (
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
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
