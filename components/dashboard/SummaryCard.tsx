import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
}

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  trend,
  variant = "default",
}: SummaryCardProps) {
  if (loading) {
    return (
      <Card className="hover-lift border-0 shadow-lg bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const iconColors = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <Card className="hover-lift shine border-0 shadow-lg bg-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className={cn(
            "flex items-center justify-center h-10 w-10 rounded-xl",
            iconColors[variant]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold tracking-tight whitespace-pre-line">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <span className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded-md",
              trend.isPositive 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
