import { useState } from "react";
import { getProducts, getSales, addSale, deleteSale, getProductStock } from "@/lib/store";
import { Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function SalesPage() {
  const products = getProducts();
  const [sales, setSales] = useState<Sale[]>(getSales);
  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const product = products.find((p) => p.id === id);
    if (product) setSellingPrice(String(product.sellingPrice));
  };

  const handleAdd = () => {
    if (!productId || !quantity || !sellingPrice || !date) {
      toast.error("Please fill all fields");
      return;
    }
    const stock = getProductStock(productId);
    const qty = Number(quantity);
    if (qty > stock) {
      toast.error(`Only ${stock} items in stock`);
      return;
    }
    const product = products.find((p) => p.id === productId);
    const profit = (Number(sellingPrice) - (product?.purchasePrice || 0)) * qty;
    addSale({ productId, quantity: qty, sellingPrice: Number(sellingPrice), date });
    setSales(getSales());
    setShowForm(false);
    setProductId(""); setQuantity(""); setSellingPrice("");
    toast.success(`Sale recorded! Profit: ₹${profit.toLocaleString("en-IN")}`, { duration: 4000 });
  };

  const handleDelete = (id: string) => {
    deleteSale(id);
    setSales(getSales());
    toast.success("Sale deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">Stock out records</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-press" disabled={products.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Add Sale
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <p className="font-semibold">New Sale</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Product *</Label>
                  <Select value={productId} onValueChange={handleProductSelect}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => {
                        const stock = getProductStock(p.id);
                        return (
                          <SelectItem key={p.id} value={p.id} disabled={stock === 0}>
                            {p.name} ({stock} in stock)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity *</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" className="mt-1" />
                </div>
                <div>
                  <Label>Selling Price *</Label>
                  <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="800" className="mt-1" />
                </div>
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} className="btn-press">Save Sale</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="table-header text-left py-3 px-4">Date</th>
              <th className="table-header text-left py-3 px-4">Product</th>
              <th className="table-header text-right py-3 px-4 w-24">Qty</th>
              <th className="table-header text-right py-3 px-4 w-32">Price</th>
              <th className="table-header text-right py-3 px-4 w-32">Total</th>
              <th className="table-header text-right py-3 px-4 w-32">Profit</th>
              <th className="table-header text-center py-3 px-4 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sales.sort((a, b) => b.date.localeCompare(a.date)).map((sale) => {
              const product = products.find((p) => p.id === sale.productId);
              const profit = product ? (sale.sellingPrice - product.purchasePrice) * sale.quantity : 0;
              return (
                <tr key={sale.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-sm">{new Date(sale.date).toLocaleDateString("en-IN")}</td>
                  <td className="py-3 px-4 text-sm font-medium">{product?.name || "Unknown"}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono-nums">{sale.quantity}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono-nums">₹{sale.sellingPrice.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 text-sm text-right font-mono-nums">₹{(sale.sellingPrice * sale.quantity).toLocaleString("en-IN")}</td>
                  <td className={`py-3 px-4 text-sm text-right font-mono-nums ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                    ₹{profit.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sales.length === 0 && (
          <div className="py-12 text-center border-t border-dashed">
            <p className="text-sm text-muted-foreground">No sales recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
