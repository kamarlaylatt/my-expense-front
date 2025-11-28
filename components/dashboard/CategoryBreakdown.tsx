import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface CategoryBreakdownItem {
  category: {
    id: number;
    name: string;
    color?: string;
  };
  totalAmount: number;
  count: number;
}

interface CategoryBreakdownProps {
  data: CategoryBreakdownItem[];
  loading?: boolean;
}

export function CategoryBreakdown({ data, loading }: CategoryBreakdownProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses yet</p>
        ) : (
          <div className="space-y-4">
            {data.map((item) => {
              const percentage = totalAmount > 0 
                ? Math.round((item.totalAmount / totalAmount) * 100) 
                : 0;
              
              return (
                <div key={item.category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.category.color || "#888888" }}
                      />
                      <span className="text-sm font-medium">{item.category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.count} expense{item.count !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.totalAmount)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full transition-all"
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
