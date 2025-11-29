"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Coins, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Currency } from "@/types";

const currencySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  usdExchangeRate: z.number().positive("Exchange rate must be positive"),
});

type CurrencyFormData = z.infer<typeof currencySchema>;

interface CurrencyFormProps {
  currency?: Currency;
  onSubmit: (data: CurrencyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CurrencyForm({
  currency,
  onSubmit,
  onCancel,
  isLoading,
}: CurrencyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      name: currency?.name || "",
      usdExchangeRate: currency?.usdExchangeRate 
        ? (typeof currency.usdExchangeRate === "string" 
            ? parseFloat(currency.usdExchangeRate) 
            : currency.usdExchangeRate)
        : 1,
    },
  });

  const handleFormSubmit = async (data: CurrencyFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Currency Name/Code</Label>
        <div className="relative">
          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            placeholder="e.g., USD, EUR, MMK"
            className="pl-10 h-11 bg-muted/50"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="usdExchangeRate" className="text-sm font-medium">
          USD Exchange Rate
        </Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="usdExchangeRate"
            type="number"
            step="0.00000001"
            placeholder="1.0"
            className="pl-10 h-11 bg-muted/50"
            {...register("usdExchangeRate", { valueAsNumber: true })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          How much is 1 unit of this currency worth in USD? (e.g., USD = 1.0, EUR ≈ 1.085)
        </p>
        {errors.usdExchangeRate && (
          <p className="text-sm text-destructive">{errors.usdExchangeRate.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="rounded-xl min-w-[100px]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : currency ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
