"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import type { Category, Expense } from "@/types";

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.date().optional(),
  categoryId: z.number().positive("Please select a category"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  categories: Category[];
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExpenseForm({
  expense,
  categories,
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
      amount: expense?.amount || 0,
      description: expense?.description || "",
      categoryId: expense?.categoryId || 0,
      date: expense?.date ? new Date(expense.date) : new Date(),
    },
  });

  useEffect(() => {
    if (date) {
      setValue("date", date);
    }
  }, [date, setValue]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this expense for?"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select
          defaultValue={expense?.categoryId ? expense.categoryId.toString() : undefined}
          onValueChange={(value) => setValue("categoryId", parseInt(value))}
        >
          <SelectTrigger>
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
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : expense ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
