import { useEffect, useState } from "react";
import { getProducts, addProduct, deleteProduct, getPurchases, getSales } from "@/lib/store";
import { SIZES, Product, Purchase, Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockBadge } from "@/components/StockBadge";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ProductsPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

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

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const reloadProducts = async () => {
    const p = await getProducts();
    setProducts(p);
  };

  const handleAdd = async () => {
    if (!name || !purchasePrice || !sellingPrice) {
      toast.error("Please fill all required fields");
      return;
    }

    await addProduct({
  name,
  size: size || "",
  purchasePrice: Number(purchasePrice),
  sellingPrice: Number(sellingPrice),
});
    await reloadProducts();

    setShowForm(false);
    setName("");
    setSize("");
    setPurchasePrice("");
    setSellingPrice("");

    toast.success(`Product "${name}" added`);
  };

  const handleDelete = async (id: string, productName: string) => {
    await deleteProduct(id);
    await reloadProducts();
    toast.success(`Product "${productName}" deleted`);
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} products
          </p>
        </div>

        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
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

              <p className="font-semibold">New Product</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="White Linen Shirt"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Size (optional)</Label>

                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>

                    <SelectContent>
                      {SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>

                  </Select>
                </div>

                <div>
                  <Label>Purchase Price *</Label>
                  <Input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="500"
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

              </div>

              <div className="flex gap-2">
                <Button onClick={handleAdd}>
                  Save Product
                </Button>

                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-sm">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />

      </div>

      <div className="bg-card border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4">Product</th>
              <th className="text-left py-3 px-4">Size</th>
              <th className="text-right py-3 px-4">Buy Price</th>
              <th className="text-right py-3 px-4">Sell Price</th>
              <th className="text-center py-3 px-4">Stock</th>
              <th className="text-center py-3 px-4"></th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((p) => {

              const stock = getProductStock(p.id);

              return (

                <tr key={p.id} className="border-b hover:bg-muted/30">

                  <td className="py-3 px-4 text-sm font-medium">
                    {p.name}
                  </td>

                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {p.size || "—"}
                  </td>

                  <td className="py-3 px-4 text-sm text-right">
                    ₹{p.purchasePrice}
                  </td>

                  <td className="py-3 px-4 text-sm text-right">
                    ₹{p.sellingPrice}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <StockBadge stock={stock} />
                  </td>

                  <td className="py-3 px-4 text-center">

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id, p.name)}
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