"use client";

import { MoreHorizontal, Pencil, Trash, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const expenseCount = category._count?.expenses || 0;
  
  return (
    <Card className="group relative hover-lift shine border-0 shadow-lg overflow-hidden bg-card">
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: category.color || "#888888" }}
      />
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pl-6">
        <div className="flex items-start gap-3">
          <div 
            className="flex items-center justify-center h-10 w-10 rounded-xl transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${category.color}15` || "#88888815" }}
          >
            <div 
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: category.color || "#888888" }}
            />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {category.description}
              </p>
            )}
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
            <DropdownMenuItem onClick={() => onEdit(category)} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => onDelete(category)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pl-6">
        <Badge 
          variant="secondary"
          className="rounded-full font-normal px-3 py-1"
        >
          <Receipt className="mr-1.5 h-3 w-3" />
          {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
        </Badge>
      </CardContent>
    </Card>
  );
}
