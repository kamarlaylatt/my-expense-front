"use client";

import { MoreHorizontal, Pencil, Trash, Coins } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Currency } from "@/types";

interface CurrencyCardProps {
  currency: Currency;
  onEdit: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
}

export function CurrencyCard({ currency, onEdit, onDelete }: CurrencyCardProps) {
  const exchangeRate = typeof currency.usdExchangeRate === "string" 
    ? parseFloat(currency.usdExchangeRate) 
    : currency.usdExchangeRate;

  return (
    <Card className="group relative border-0 shadow-lg hover-lift shine overflow-hidden transition-all duration-300">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{currency.name}</h3>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(currency)} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => onDelete(currency)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">USD Exchange Rate</span>
            <span className="font-medium">
              1 {currency.name} = {exchangeRate.toFixed(8)} USD
            </span>
          </div>
          {exchangeRate !== 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Inverse Rate</span>
              <span className="font-medium">
                1 USD = {(1 / exchangeRate).toFixed(2)} {currency.name}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
