import { useState, useMemo } from "react";
import { getProducts, getSales } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToExcel } from "@/lib/export";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportsPage() {
  const products = getProducts();
  const sales = getSales();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const filteredSales = useMemo(
    () => sales.filter((s) => s.date >= startDate && s.date <= endDate),
    [sales, startDate, endDate]
  );

  // Daily profit
  const dailyData = useMemo(() => {
    const map: Record<string, { revenue: number; profit: number; cost: number }> = {};
    filteredSales.forEach((s) => {
      const product = products.find((p) => p.id === s.productId);
      if (!product) return;
      if (!map[s.date]) map[s.date] = { revenue: 0, profit: 0, cost: 0 };
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
        ...data,
      }));
  }, [filteredSales, products]);

  // Monthly profit
  const monthlyData = useMemo(() => {
    const map: Record<string, { revenue: number; profit: number }> = {};
    filteredSales.forEach((s) => {
      const product = products.find((p) => p.id === s.productId);
      if (!product) return;
      const month = s.date.slice(0, 7);
      if (!map[month]) map[month] = { revenue: 0, profit: 0 };
      map[month].revenue += s.sellingPrice * s.quantity;
      map[month].profit += (s.sellingPrice - product.purchasePrice) * s.quantity;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        ...data,
      }));
  }, [filteredSales, products]);

  // Best sellers
  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};
    filteredSales.forEach((s) => {
      const product = products.find((p) => p.id === s.productId);
      if (!product) return;
      if (!map[s.productId]) map[s.productId] = { name: product.name, qty: 0, revenue: 0, profit: 0 };
      map[s.productId].qty += s.quantity;
      map[s.productId].revenue += s.sellingPrice * s.quantity;
      map[s.productId].profit += (s.sellingPrice - product.purchasePrice) * s.quantity;
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [filteredSales, products]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0);
  const totalProfit = filteredSales.reduce((sum, s) => {
    const product = products.find((p) => p.id === s.productId);
    if (!product) return sum;
    return sum + (s.sellingPrice - product.purchasePrice) * s.quantity;
  }, 0);

  const handleExportDaily = () => exportToExcel(dailyData, "Daily_Profit_Report");
  const handleExportMonthly = () => exportToExcel(monthlyData, "Monthly_Profit_Report");
  const handleExportBestSellers = () => exportToExcel(bestSellers, "Best_Selling_Products");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyze your sales and profit</p>
      </div>

      {/* Date Filters */}
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <Label className="text-xs">From</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-40" />
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-40" />
        </div>
        <div className="flex gap-4 ml-auto">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold font-mono-nums">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Profit</p>
            <p className="text-lg font-bold font-mono-nums text-success">₹{totalProfit.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="bestsellers">Best Sellers</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleExportDaily} disabled={dailyData.length === 0}>
              <Download className="mr-2 h-3 w-3" /> Export
            </Button>
          </div>
          {dailyData.length > 0 ? (
            <>
              <div className="bg-card border rounded-lg p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
                    <Bar dataKey="revenue" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} name="Revenue" />
                    <Bar dataKey="profit" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} name="Profit" opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="table-header text-left py-3 px-4">Date</th>
                      <th className="table-header text-right py-3 px-4">Revenue</th>
                      <th className="table-header text-right py-3 px-4">Cost</th>
                      <th className="table-header text-right py-3 px-4">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((d, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-3 px-4 text-sm">{d.date}</td>
                        <td className="py-3 px-4 text-sm text-right font-mono-nums">₹{d.revenue.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 text-sm text-right font-mono-nums">₹{d.cost.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 text-sm text-right font-mono-nums text-success">₹{d.profit.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-12 text-center border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No sales data in this period.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleExportMonthly} disabled={monthlyData.length === 0}>
              <Download className="mr-2 h-3 w-3" /> Export
            </Button>
          </div>
          {monthlyData.length > 0 ? (
            <div className="bg-card border rounded-lg p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
                  <Bar dataKey="revenue" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="profit" fill="hsl(142,76%,36%)" radius={[4, 4, 0, 0]} name="Profit" opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No sales data in this period.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bestsellers" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleExportBestSellers} disabled={bestSellers.length === 0}>
              <Download className="mr-2 h-3 w-3" /> Export
            </Button>
          </div>
          {bestSellers.length > 0 ? (
            <div className="bg-card border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="table-header text-left py-3 px-4">#</th>
                    <th className="table-header text-left py-3 px-4">Product</th>
                    <th className="table-header text-right py-3 px-4">Units Sold</th>
                    <th className="table-header text-right py-3 px-4">Revenue</th>
                    <th className="table-header text-right py-3 px-4">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellers.map((item, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-sm text-right font-mono-nums">{item.qty}</td>
                      <td className="py-3 px-4 text-sm text-right font-mono-nums">₹{item.revenue.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-sm text-right font-mono-nums text-success">₹{item.profit.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">No sales data in this period.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
