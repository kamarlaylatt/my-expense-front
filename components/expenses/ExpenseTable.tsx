"use client";

import { MoreHorizontal, Pencil, Trash, Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense } from "@/types";

interface ExpenseTableProps {
  expenses: Expense[];
  loading?: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseTable({
  expenses,
  loading,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  // Ensure expenses is always an array
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  if (loading) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="text-right font-semibold">Amount</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (safeExpenses.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Receipt className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-muted-foreground">No expenses found</p>
        <p className="text-sm text-muted-foreground mt-1">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="text-right font-semibold">Amount</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeExpenses.map((expense) => (
            <TableRow key={expense.id} className="group">
              <TableCell className="font-medium text-muted-foreground">
                {formatDate(expense.date)}
              </TableCell>
              <TableCell className="font-medium">
                {expense.description || <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                {expense.category && (
                  <Badge
                    variant="secondary"
                    className="rounded-full font-medium px-3 py-1 border-0"
                    style={{
                      backgroundColor: expense.category.color
                        ? `${expense.category.color}15`
                        : undefined,
                      color: expense.category.color || undefined,
                    }}
                  >
                    <div
                      className="mr-2 h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: expense.category.color || "#888888",
                      }}
                    />
                    {expense.category.name}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <span className="font-semibold text-foreground">
                  {formatCurrency(expense.amount)}
                </span>
              </TableCell>
              <TableCell>
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
                    <DropdownMenuItem onClick={() => onEdit(expense)} className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => onDelete(expense)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
