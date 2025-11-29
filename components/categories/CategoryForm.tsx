"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, FileText, Palette, Check } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional().or(z.literal("")),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const colorPresets = [
  { color: "#EF4444", name: "Red" },
  { color: "#F97316", name: "Orange" },
  { color: "#EAB308", name: "Yellow" },
  { color: "#22C55E", name: "Green" },
  { color: "#14B8A6", name: "Teal" },
  { color: "#3B82F6", name: "Blue" },
  { color: "#8B5CF6", name: "Violet" },
  { color: "#EC4899", name: "Pink" },
  { color: "#6366F1", name: "Indigo" },
  { color: "#84CC16", name: "Lime" },
];

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      color: category?.color || "#3B82F6",
    },
  });

  const selectedColor = watch("color");

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit({
      ...data,
      color: data.color || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            placeholder="Category name"
            className="pl-10 h-11 bg-muted/50"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description (optional)</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="description"
            placeholder="Category description"
            className="pl-10 h-11 bg-muted/50"
            {...register("description")}
          />
        </div>
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Color</Label>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {colorPresets.map(({ color, name }) => (
            <button
              key={color}
              type="button"
              title={name}
              className={cn(
                "relative h-10 w-full rounded-xl transition-all hover:scale-105",
                selectedColor === color && "ring-2 ring-offset-2 ring-offset-background"
              )}
              style={
                {
                  backgroundColor: color,
                  "--tw-ring-color": color,
                } as React.CSSProperties
              }
              onClick={() => setValue("color", color)}
            >
              {selectedColor === color && (
                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Input
            id="color"
            type="text"
            placeholder="#000000"
            className="flex-1 h-10 bg-muted/50 font-mono text-sm"
            {...register("color")}
          />
          <div
            className="h-10 w-10 rounded-xl border-2 flex-shrink-0"
            style={{ backgroundColor: selectedColor || "#888888" }}
          />
        </div>
        {errors.color && (
          <p className="text-sm text-destructive">{errors.color.message}</p>
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
          ) : category ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
