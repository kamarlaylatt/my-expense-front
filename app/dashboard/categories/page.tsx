"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryForm } from "@/components/categories/CategoryForm";
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
import { categoriesApi, getErrorMessage } from "@/lib/api";
import type { Category } from "@/types";
import { Plus, FolderOpen, Tag, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await categoriesApi.getAll();
      if (response.success && response.data) {
        const categoriesData = response.data.categories || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateOrUpdateCategory = async (data: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    setIsSubmitting(true);
    try {
      let response;
      if (editingCategory) {
        response = await categoriesApi.update(editingCategory.id, data);
      } else {
        response = await categoriesApi.create(data);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: editingCategory
            ? "Category updated successfully"
            : "Category created successfully",
        });
        setIsDialogOpen(false);
        setEditingCategory(null);
        fetchCategories();
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

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;

    try {
      const response = await categoriesApi.delete(deleteCategory.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        setDeleteCategory(null);
        fetchCategories();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeleteCategory(category);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground mt-1">
              Organize your expenses with custom categories
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="rounded-xl h-11 px-5 shadow-lg shadow-primary/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
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
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first category to start organizing your expenses
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="rounded-xl h-11 px-6"
            >
              <Tag className="mr-2 h-4 w-4" />
              Create your first category
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            {Array.isArray(categories) && categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below."
                : "Create a new category for organizing your expenses."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={handleCreateOrUpdateCategory}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingCategory(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Delete Category</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete <span className="font-medium text-foreground">&quot;{deleteCategory?.name}&quot;</span>? 
              This action cannot be undone. Expenses in this category will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteCategory(null)}
              className="rounded-xl min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCategory}
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
