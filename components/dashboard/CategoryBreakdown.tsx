import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { PieChart } from "lucide-react";
import type { CategoryTotal } from "@/types";

interface CategoryBreakdownProps {
  data: CategoryTotal[];
  loading?: boolean;
}

// Helper function to calculate total amount across all currencies for a category
function getCategoryTotalAmount(item: CategoryTotal): number {
  if (!item.byCurrency || item.byCurrency.length === 0) {
    return 0;
  }
  return item.byCurrency.reduce((sum, currencyItem) => {
    // Convert to USD equivalent for comparison
    const amount = parseFloat(currencyItem.totalAmount || "0");
    const exchangeRate = parseFloat(currencyItem.currency.usdExchangeRate || "1");
    return sum + (amount * exchangeRate);
  }, 0);
}

// Format category totals by currency
function formatCategoryAmounts(item: CategoryTotal): string {
  if (!item.byCurrency || item.byCurrency.length === 0) {
    return formatCurrency(0);
  }
  return item.byCurrency
    .map(c => `${formatCurrency(parseFloat(c.totalAmount || "0"))} ${c.currency.name}`)
    .join(", ");
}

export function CategoryBreakdown({ data, loading }: CategoryBreakdownProps) {
  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const safeData = Array.isArray(data) ? data : [];
  const totalAmount = safeData.reduce((sum, item) => sum + getCategoryTotalAmount(item), 0);

  return (
    <Card className="border-0 shadow-lg hover-lift shine overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Spending by Category</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {safeData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <PieChart className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No expenses yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add some expenses to see the breakdown</p>
          </div>
        ) : (
          <div className="space-y-5">
            {safeData.map((item) => {
              const itemAmount = getCategoryTotalAmount(item);
              const percentage = totalAmount > 0 
                ? Math.round((itemAmount / totalAmount) * 100) 
                : 0;
              
              return (
                <div key={item.category.id} className="space-y-2.5 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-4 w-4 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: item.category.color || "#888888",
                          "--tw-ring-color": item.category.color || "#888888",
                        } as React.CSSProperties}
                      />
                      <span className="text-sm font-medium">{item.category.name}</span>
                      <Badge 
                        variant="secondary" 
                        className="text-xs font-normal px-2 py-0 h-5 bg-muted"
                      >
                        {item.totalCount} {item.totalCount === 1 ? "expense" : "expenses"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                      <span className="text-sm font-semibold">
                        {formatCategoryAmounts(item)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.category.color || "#888888",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
