import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
  isCurrency?: boolean;
}

export function StatCard({ label, value, trend, className, isCurrency }: StatCardProps) {
  return (
    <div className={cn("p-6 bg-card border rounded-lg", className)}>
      <p className="table-header">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={cn("stat-value", isCurrency && "font-mono-nums")}>
          {isCurrency ? `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : value}
        </span>
        {trend && <span className="text-sm font-medium text-success">+{trend}%</span>}
      </div>
    </div>
  );
}
