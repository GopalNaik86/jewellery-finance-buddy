import { useEffect, useState } from "react";
import { getProducts, getPurchases, getSales, getTodaySales, getTodayProfit, getBestSellingProduct, getProductStock } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { StockBadge } from "@/components/StockBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [, setTick] = useState(0);
  useEffect(() => { setTick((t) => t + 1); }, []);

  const products = getProducts();
  const purchases = getPurchases();
  const sales = getSales();
  const todaySales = getTodaySales();
  const todayProfit = getTodayProfit();
  const bestSeller = getBestSellingProduct();

  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0);
  const todaySalesCount = todaySales.reduce((sum, s) => sum + s.quantity, 0);

  const stockData = products.map((p) => ({
    ...p,
    stock: getProductStock(p.id),
  }));

  const lowStockItems = stockData.filter((p) => p.stock < 5).sort((a, b) => a.stock - b.stock);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];

    const daySales = sales.filter((s) => s.date === dateStr);

    const revenue = daySales.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0);

    const profit = daySales.reduce((sum, s) => {
      const product = products.find((p) => p.id === s.productId);
      if (!product) return sum;
      return sum + (s.sellingPrice - product.purchasePrice) * s.quantity;
    }, 0);

    return {
      date: d.toLocaleDateString("en-IN", { weekday: "short" }),
      revenue,
      profit,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your shop's performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Today's Sales" value={todaySalesTotal} isCurrency />
        <StatCard label="Today's Profit" value={todayProfit} isCurrency />
        <StatCard label="Items Sold Today" value={todaySalesCount} />
      </div>

      {bestSeller && (
        <div className="p-4 bg-card border rounded-lg">
          <p className="table-header mb-2">Best Selling Product</p>
          <p className="text-lg font-semibold">{bestSeller.product.name}</p>
          <p className="text-sm text-muted-foreground">
            {bestSeller.totalSold} units sold
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <p className="table-header mb-4">Last 7 Days Performance</p>

          {sales.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-sm text-muted-foreground">No sales data yet. Add your first sale.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(214,32%,91%)" }}
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                />
                <Bar dataKey="revenue" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="profit" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} name="Profit" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6">
          <p className="table-header mb-4">Stock Alerts</p>

          {lowStockItems.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
              <p className="text-sm text-muted-foreground">All products are well stocked.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[200px] overflow-auto">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-background">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                  </div>
                  <StockBadge stock={item.stock} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}