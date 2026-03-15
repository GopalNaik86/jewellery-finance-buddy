import { useEffect, useState } from "react";
import { getProducts, getPurchases, getSales } from "@/lib/store";
import { Product, Purchase, Sale } from "@/lib/types";
import { StockBadge } from "@/components/StockBadge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { exportToExcel } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");

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

  function getProductStock(productId: string) {
    const totalPurchased = purchases
      .filter((p) => p.productId === productId)
      .reduce((sum, p) => sum + p.quantity, 0);

    const totalSold = sales
      .filter((s) => s.productId === productId)
      .reduce((sum, s) => sum + s.quantity, 0);

    return totalPurchased - totalSold;
  }

  const stockData = products.map((p) => ({
    ...p,
    stock: getProductStock(p.id),
  }));

  const filtered = stockData.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToExcel(
      filtered.map((p) => ({
        "Product Name": p.name,
        Size: p.size || "—",
        Color: p.color || "—",
        "Purchase Price": p.purchasePrice,
        "Selling Price": p.sellingPrice,
        Stock: p.stock,
        Status:
          p.stock === 0
            ? "Out of Stock"
            : p.stock < 5
            ? "Low Stock"
            : "In Stock",
      })),
      "Inventory_Report"
    );
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Current stock levels
          </p>
        </div>

        <Button onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="pl-9"
        />
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4">Product</th>
              <th className="text-left py-3 px-4">Size</th>
              <th className="text-left py-3 px-4">Color</th>
              <th className="text-right py-3 px-4 w-24">Stock</th>
              <th className="text-center py-3 px-4 w-36">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered
              .sort((a, b) => a.stock - b.stock)
              .map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-b-0 hover:bg-muted/30"
                >
                  <td className="py-3 px-4 text-sm font-medium">{p.name}</td>

                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {p.size || "—"}
                  </td>

                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {p.color || "—"}
                  </td>

                  <td className="py-3 px-4 text-sm text-right font-semibold">
                    {p.stock}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <StockBadge stock={p.stock} />
                  </td>
                </tr>
              ))}
          </tbody>

        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center border-t border-dashed">
            <p className="text-sm text-muted-foreground">
              No inventory data.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}