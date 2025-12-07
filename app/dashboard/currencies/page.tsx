"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CurrencyCard } from "@/components/currencies/CurrencyCard";
import { CurrencyForm } from "@/components/currencies/CurrencyForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { currenciesApi, getErrorMessage } from "@/lib/api";
import type { Currency } from "@/types";
import { Plus, Coins, Trash2 } from "lucide-react";

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [deleteCurrency, setDeleteCurrency] = useState<Currency | null>(null);

  const { toast } = useToast();

  const fetchCurrencies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await currenciesApi.getAll();
      if (response.success && response.data) {
        const currenciesData = response.data.currencies || [];
        setCurrencies(Array.isArray(currenciesData) ? currenciesData : []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      console.error("Failed to fetch currencies:", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const handleCreateOrUpdateCurrency = async (data: {
    name: string;
    usdExchangeRate: number;
  }) => {
    setIsSubmitting(true);
    try {
      let response;
      if (editingCurrency) {
        response = await currenciesApi.update(editingCurrency.id, data);
      } else {
        response = await currenciesApi.create(data);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: editingCurrency
            ? "Currency updated successfully"
            : "Currency created successfully",
        });
        setIsDialogOpen(false);
        setEditingCurrency(null);
        fetchCurrencies();
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

  const handleDeleteCurrency = async () => {
    if (!deleteCurrency) return;

    try {
      const response = await currenciesApi.delete(deleteCurrency.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Currency deleted successfully",
        });
        setDeleteCurrency(null);
        fetchCurrencies();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setIsDialogOpen(true);
  };

  const handleDelete = (currency: Currency) => {
    setDeleteCurrency(currency);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Currencies</h1>
            <p className="text-muted-foreground mt-1">
              Manage currencies and exchange rates for your expenses
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="rounded-xl h-11 px-5 shadow-lg shadow-primary/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Currency
          </Button>
        </div>

        {/* Currencies Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border-0 bg-card shadow-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : currencies.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Coins className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No currencies yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first currency to start tracking expenses in multiple currencies
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="rounded-xl h-11 px-6"
            >
              <Coins className="mr-2 h-4 w-4" />
              Create your first currency
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            {Array.isArray(currencies) && currencies.map((currency) => (
              <CurrencyCard
                key={currency.id}
                currency={currency}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Currency Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingCurrency(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingCurrency ? "Edit Currency" : "Add Currency"}
            </DialogTitle>
            <DialogDescription>
              {editingCurrency
                ? "Update the currency details below."
                : "Create a new currency with its USD exchange rate."}
            </DialogDescription>
          </DialogHeader>
          <CurrencyForm
            currency={editingCurrency || undefined}
            onSubmit={handleCreateOrUpdateCurrency}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingCurrency(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCurrency} onOpenChange={() => setDeleteCurrency(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Currency</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete <span className="font-medium text-foreground">&quot;{deleteCurrency?.name}&quot;</span>? 
              This will also delete all expenses using this currency. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteCurrency(null)}
              className="rounded-xl min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCurrency}
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
