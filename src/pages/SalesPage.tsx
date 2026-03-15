import { useEffect, useState } from "react";
import { getProducts, getSales, addSale, deleteSale, getPurchases } from "@/lib/store";
import { Product, Sale, Purchase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function SalesPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    async function loadData() {
      const p = await getProducts();
      const s = await getSales();
      const pur = await getPurchases();

      setProducts(p);
      setSales(s);
      setPurchases(pur);
    }

    loadData();
  }, []);

  const reloadSales = async () => {
    const s = await getSales();
    setSales(s);
  };

  function getProductStock(productId: string) {

    const totalPurchased = purchases
      .filter((p) => p.productId === productId)
      .reduce((sum, p) => sum + p.quantity, 0);

    const totalSold = sales
      .filter((s) => s.productId === productId)
      .reduce((sum, s) => sum + s.quantity, 0);

    return totalPurchased - totalSold;
  }

  const handleProductSelect = (id: string) => {

    setProductId(id);

    const product = products.find((p) => p.id === id);

    if (product) {
      setSellingPrice(String(product.sellingPrice));
    }
  };

  const handleAdd = async () => {

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

    const profit =
      (Number(sellingPrice) - (product?.purchasePrice || 0)) * qty;

    await addSale({
      productId,
      quantity: qty,
      sellingPrice: Number(sellingPrice),
      date
    });

    await reloadSales();

    setShowForm(false);
    setProductId("");
    setQuantity("");
    setSellingPrice("");

    toast.success(
      `Sale recorded! Profit: ₹${profit.toLocaleString("en-IN")}`,
      { duration: 4000 }
    );
  };

  const handleDelete = async (id: string) => {

    await deleteSale(id);
    await reloadSales();

    toast.success("Sale deleted");
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stock out records
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          disabled={products.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </Button>

      </div>

      <AnimatePresence>

        {showForm && (

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >

            <div className="bg-card border rounded-lg p-6 space-y-4">

              <p className="font-semibold">New Sale</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div>

                  <Label>Product *</Label>

                  <Select value={productId} onValueChange={handleProductSelect}>

                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>

                    <SelectContent>

                      {products.map((p) => {

                        const stock = getProductStock(p.id);

                        return (

                          <SelectItem
                            key={p.id}
                            value={p.id}
                            disabled={stock === 0}
                          >
                            {p.name} ({stock} in stock)
                          </SelectItem>

                        );

                      })}

                    </SelectContent>

                  </Select>

                </div>

                <div>

                  <Label>Quantity *</Label>

                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                    className="mt-1"
                  />

                </div>

                <div>

                  <Label>Selling Price *</Label>

                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="800"
                    className="mt-1"
                  />

                </div>

                <div>

                  <Label>Date *</Label>

                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1"
                  />

                </div>

              </div>

              <div className="flex gap-2">

                <Button onClick={handleAdd}>
                  Save Sale
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

      <div className="bg-card border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead>

            <tr className="border-b bg-muted/50">

              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Product</th>
              <th className="text-right py-3 px-4">Qty</th>
              <th className="text-right py-3 px-4">Price</th>
              <th className="text-right py-3 px-4">Total</th>
              <th className="text-right py-3 px-4">Profit</th>
              <th className="text-center py-3 px-4"></th>

            </tr>

          </thead>

          <tbody>

            {sales
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((sale) => {

                const product = products.find(
                  (p) => p.id === sale.productId
                );

                const profit = product
                  ? (sale.sellingPrice - product.purchasePrice) *
                    sale.quantity
                  : 0;

                return (

                  <tr
                    key={sale.id}
                    className="border-b hover:bg-muted/30"
                  >

                    <td className="py-3 px-4 text-sm">
                      {new Date(sale.date).toLocaleDateString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-sm font-medium">
                      {product?.name || "Unknown"}
                    </td>

                    <td className="py-3 px-4 text-sm text-right">
                      {sale.quantity}
                    </td>

                    <td className="py-3 px-4 text-sm text-right">
                      ₹{sale.sellingPrice}
                    </td>

                    <td className="py-3 px-4 text-sm text-right">
                      ₹{sale.sellingPrice * sale.quantity}
                    </td>

                    <td className="py-3 px-4 text-sm text-right">
                      ₹{profit}
                    </td>

                    <td className="py-3 px-4 text-center">

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(sale.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </td>

                  </tr>

                );

              })}

          </tbody>

        </table>

      </div>

    </div>
  );
}