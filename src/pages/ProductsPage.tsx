import { useState } from "react";
import { getProducts, addProduct, deleteProduct, getProductStock } from "@/lib/store";
import { SIZES, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockBadge } from "@/components/StockBadge";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!name || !purchasePrice || !sellingPrice) {
      toast.error("Please fill all required fields");
      return;
    }

    addProduct({
      name,
      size: size || undefined,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
    });

    setProducts(getProducts());
    setShowForm(false);
    setName("");
    setSize("");
    setPurchasePrice("");
    setSellingPrice("");

    toast.success(`Product "${name}" added`);
  };

  const handleDelete = (id: string, productName: string) => {
    deleteProduct(id);
    setProducts(getProducts());
    toast.success(`Product "${productName}" deleted`);
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>
        </div>

        <Button onClick={() => setShowForm(!showForm)} className="btn-press">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Add Product Form */}

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
                <Button onClick={handleAdd} className="btn-press">
                  Save Product
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

      {/* Search */}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      {/* Products Table */}

      <div className="bg-card border rounded-lg overflow-hidden">

        <table className="w-full">

          <thead>
            <tr className="border-b bg-muted/50">
              <th className="table-header text-left py-3 px-4">Product</th>
              <th className="table-header text-left py-3 px-4">Size</th>
              <th className="table-header text-right py-3 px-4 w-28">Buy Price</th>
              <th className="table-header text-right py-3 px-4 w-28">Sell Price</th>
              <th className="table-header text-center py-3 px-4 w-32">Stock</th>
              <th className="table-header text-center py-3 px-4 w-16"></th>
            </tr>
          </thead>

          <tbody>

            <AnimatePresence>

              {filtered.map((p) => {

                const stock = getProductStock(p.id);

                return (

                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >

                    <td className="py-3 px-4 text-sm font-medium">
                      {p.name}
                    </td>

                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {p.size || "—"}
                    </td>

                    <td className="py-3 px-4 text-sm text-right font-mono-nums">
                      ₹{p.purchasePrice.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-sm text-right font-mono-nums">
                      ₹{p.sellingPrice.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StockBadge stock={stock} />
                    </td>

                    <td className="py-3 px-4 text-center">

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id, p.name)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </td>

                  </motion.tr>

                );

              })}

            </AnimatePresence>

          </tbody>

        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center border-t border-dashed">
            <p className="text-sm text-muted-foreground">
              {products.length === 0
                ? "No products yet. Add your first product."
                : "No products match your search."}
            </p>
          </div>
        )}

      </div>

    </div>
  );
}