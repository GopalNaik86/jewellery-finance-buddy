import { useEffect, useState } from "react";
import { getProducts, getPurchases, getSales, getProductStock } from "@/lib/store";
import { Product, Purchase, Sale } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { StockBadge } from "@/components/StockBadge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    async function loadData() {
      const p = await getProducts();
      const pur = await getPurchases();
      const s = await getSales();

      setProducts(p);
      setPurchases(pur);
      setSales(s);
    }

    loadData();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const todaySales = sales.filter((s) => s.date.startsWith(today));

  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0);
  const todaySalesCount = todaySales.reduce((sum, s) => sum + s.quantity, 0);

  const todayProfit = todaySales.reduce((sum, s) => {
    const product = products.find((p) => p.id === s.productId);
    if (!product) return sum;
    return sum + (s.sellingPrice - product.purchasePrice) * s.quantity;
  }, 0);
const stockData = products.map((p) => {

  const purchased = purchases
    .filter((x) => x.productId === p.id)
    .reduce((sum, x) => sum + x.quantity, 0);

  const sold = sales
    .filter((x) => x.productId === p.id)
    .reduce((sum, x) => sum + x.quantity, 0);

  return {
    ...p,
    stock: purchased - sold,
  };
});

const lowStockItems = stockData
  .filter((p: any) => p.stock < 5)
  .sort((a: any, b: any) => a.stock - b.stock);

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

  const bestSeller = (() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      map[s.productId] = (map[s.productId] || 0) + s.quantity;
    });

    const best = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    if (!best) return null;

    const product = products.find((p) => p.id === best[0]);
    if (!product) return null;

    return { product, totalSold: best[1] };
  })();

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

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]} />
              <Bar dataKey="revenue" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <p className="table-header mb-4">Stock Alerts</p>

          {lowStockItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products are well stocked.</p>
          ) : (
            <div className="space-y-3">
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