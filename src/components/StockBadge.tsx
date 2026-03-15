import { cn } from "@/lib/utils";

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-destructive/10 text-destructive", className)}>
        Out of Stock
      </span>
    );
  }
  if (stock < 5) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-warning/10 text-warning", className)}>
        Low Stock ({stock})
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success", className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-success" />
      In Stock ({stock})
    </span>
  );
}
