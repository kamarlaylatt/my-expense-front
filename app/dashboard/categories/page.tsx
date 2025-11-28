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
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/types";
import { Plus } from "lucide-react";

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
        // Handle nested categories array
        const categoriesData = response.data.categories || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
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
      } else {
        throw new Error(response.message || "Failed to save category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save category",
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
      } else {
        throw new Error(response.message || "Failed to delete category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No categories yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first category
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details."
                : "Create a new category for organizing expenses."}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteCategory?.name}&quot;? This
              action cannot be undone. Expenses in this category will not be
              deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteCategory(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
