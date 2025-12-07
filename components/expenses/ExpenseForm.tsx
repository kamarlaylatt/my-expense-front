"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, FileText, Tag, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Category, Currency, Expense } from "@/types";

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.date().optional(),
  categoryId: z.number().positive("Please select a category"),
  currencyId: z.number().positive("Please select a currency"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  categories: Category[];
  currencies: Currency[];
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExpenseForm({
  expense,
  categories,
  currencies,
  onSubmit,
  onCancel,
  isLoading,
}: ExpenseFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    expense?.date ? new Date(expense.date) : new Date()
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount ? (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount) : 0,
      description: expense?.description || "",
      categoryId: expense?.categoryId || 0,
      currencyId: expense?.currencyId || 0,
      date: expense?.date ? new Date(expense.date) : new Date(),
    },
  });

  useEffect(() => {
    if (date) {
      setValue("date", date);
    }
  }, [date, setValue]);

  // Set default currency if available and not editing
  useEffect(() => {
    if (!expense && currencies.length > 0) {
      setValue("currencyId", currencies[0].id);
    }
  }, [currencies, expense, setValue]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="pl-10 h-11 bg-muted/50"
              {...register("amount", { valueAsNumber: true })}
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencyId" className="text-sm font-medium">Currency</Label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Select
              defaultValue={expense?.currencyId ? expense.currencyId.toString() : currencies[0]?.id?.toString()}
              onValueChange={(value) => setValue("currencyId", parseInt(value))}
            >
              <SelectTrigger className="pl-10 h-11 bg-muted/50">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(currencies) && currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id?.toString() || ""}>
                    {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.currencyId && (
            <p className="text-sm text-destructive">{errors.currencyId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="description"
            placeholder="What was this expense for?"
            className="pl-10 h-11 bg-muted/50"
            {...register("description")}
          />
        </div>
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId" className="text-sm font-medium">Category</Label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Select
            defaultValue={expense?.categoryId ? expense.categoryId.toString() : undefined}
            onValueChange={(value) => setValue("categoryId", parseInt(value))}
          >
            <SelectTrigger className="pl-10 h-11 bg-muted/50">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(categories) && categories.map((category) => (
                <SelectItem key={category.id} value={category.id?.toString() || ""}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color || "#888888" }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-11 bg-muted/50",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="rounded-xl w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="rounded-xl min-w-[120px] w-full sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : expense ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
