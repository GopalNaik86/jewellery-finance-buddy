import { useState, useMemo, useEffect } from "react";
import { getProducts, getSales } from "@/lib/store";
import { Product, Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToExcel } from "@/lib/export";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportsPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    async function loadData() {
      const p = await getProducts();
      const s = await getSales();

      setProducts(p);
      setSales(s);
    }

    loadData();
  }, []);

  const filteredSales = useMemo(
    () => sales.filter((s) => s.date >= startDate && s.date <= endDate),
    [sales, startDate, endDate]
  );

  const dailyData = useMemo(() => {

    const map: Record<string, { revenue: number; profit: number; cost: number }> = {};

    filteredSales.forEach((s) => {

      const product = products.find((p) => p.id === s.productId);
      if (!product) return;

      if (!map[s.date]) {
        map[s.date] = { revenue: 0, profit: 0, cost: 0 };
      }

      const revenue = s.sellingPrice * s.quantity;
      const cost = product.purchasePrice * s.quantity;

      map[s.date].revenue += revenue;
      map[s.date].cost += cost;
      map[s.date].profit += revenue - cost;

    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        ...data
      }));

  }, [filteredSales, products]);

  const monthlyData = useMemo(() => {

    const map: Record<string, { revenue: number; profit: number }> = {};

    filteredSales.forEach((s) => {

      const product = products.find((p) => p.id === s.productId);
      if (!product) return;

      const month = s.date.slice(0, 7);

      if (!map[month]) {
        map[month] = { revenue: 0, profit: 0 };
      }

      map[month].revenue += s.sellingPrice * s.quantity;
      map[month].profit += (s.sellingPrice - product.purchasePrice) * s.quantity;

    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        ...data
      }));

  }, [filteredSales, products]);

  const bestSellers = useMemo(() => {

    const map: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};

    filteredSales.forEach((s) => {

      const product = products.find((p) => p.id === s.productId);
      if (!product) return;

      if (!map[s.productId]) {
        map[s.productId] = {
          name: product.name,
          qty: 0,
          revenue: 0,
          profit: 0
        };
      }

      map[s.productId].qty += s.quantity;
      map[s.productId].revenue += s.sellingPrice * s.quantity;
      map[s.productId].profit += (s.sellingPrice - product.purchasePrice) * s.quantity;

    });

    return Object.values(map).sort((a, b) => b.qty - a.qty);

  }, [filteredSales, products]);

  const totalRevenue = filteredSales.reduce(
    (sum, s) => sum + s.sellingPrice * s.quantity,
    0
  );

  const totalProfit = filteredSales.reduce((sum, s) => {

    const product = products.find((p) => p.id === s.productId);
    if (!product) return sum;

    return sum + (s.sellingPrice - product.purchasePrice) * s.quantity;

  }, 0);

  const handleExportDaily = () => exportToExcel(dailyData, "Daily_Profit_Report");
  const handleExportMonthly = () => exportToExcel(monthlyData, "Monthly_Profit_Report");
  const handleExportBest = () => exportToExcel(bestSellers, "Best_Sellers_Report");

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analyze your sales and profit
        </p>
      </div>

      <div className="flex items-end gap-4 flex-wrap">

        <div>
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-40"
          />
        </div>

        <div>
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-40"
          />
        </div>

        <div className="flex gap-4 ml-auto">

          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Total Revenue
            </p>
            <p className="text-lg font-bold">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Total Profit
            </p>
            <p className="text-lg font-bold text-green-600">
              ₹{totalProfit.toLocaleString("en-IN")}
            </p>
          </div>

        </div>

      </div>

      {/* Tabs remain same */}

      {/* Rest of your UI code can stay exactly the same */}

    </div>
  );
}