import { useEffect, useState } from "react";
import { getProducts, getPurchases, addPurchase, deletePurchase } from "@/lib/store";
import { Purchase, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function PurchasesPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    async function loadData() {
      const p = await getProducts();
      const pur = await getPurchases();

      setProducts(p);
      setPurchases(pur);
    }

    loadData();
  }, []);

  const reloadPurchases = async () => {
    const pur = await getPurchases();
    setPurchases(pur);
  };

  const handleAdd = async () => {

    if (!productId || !quantity || !purchasePrice || !date) {
      toast.error("Please fill all fields");
      return;
    }

    await addPurchase({
      productId,
      quantity: Number(quantity),
      purchasePrice: Number(purchasePrice),
      date,
    });

    await reloadPurchases();

    setShowForm(false);
    setProductId("");
    setQuantity("");
    setPurchasePrice("");

    const product = products.find((p) => p.id === productId);

    toast.success(`Purchase of ${quantity} × "${product?.name}" recorded`);
  };

  const handleDelete = async (id: string) => {
    await deletePurchase(id);
    await reloadPurchases();
    toast.success("Purchase deleted");
  };

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const product = products.find((p) => p.id === id);
    if (product) setPurchasePrice(String(product.purchasePrice));
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stock in records
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          disabled={products.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Purchase
        </Button>

      </div>

      {products.length === 0 && (
        <div className="p-6 border border-dashed rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Add products first before recording purchases.
          </p>
        </div>
      )}

      <AnimatePresence>

        {showForm && (

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >

            <div className="bg-card border rounded-lg p-6 space-y-4">

              <p className="font-semibold">New Purchase</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div>
                  <Label>Product *</Label>

                  <Select value={productId} onValueChange={handleProductSelect}>

                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>

                    <SelectContent>

                      {products.map((p) => (

                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>
                </div>

                <div>
                  <Label>Quantity *</Label>

                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="10"
                    className="mt-1"
                  />
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
                  Save Purchase
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
              <th className="text-right py-3 px-4 w-24">Qty</th>
              <th className="text-right py-3 px-4 w-32">Price</th>
              <th className="text-right py-3 px-4 w-32">Total</th>
              <th className="text-center py-3 px-4 w-16"></th>
            </tr>
          </thead>

          <tbody>

            {purchases
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((purchase) => {

                const product = products.find((p) => p.id === purchase.productId);

                return (

                  <tr
                    key={purchase.id}
                    className="border-b hover:bg-muted/30"
                  >

                    <td className="py-3 px-4 text-sm">
                      {new Date(purchase.date).toLocaleDateString("en-IN")}
                    </td>

                    <td className="py-3 px-4 text-sm font-medium">
                      {product?.name || "Unknown"}
                    </td>

                    <td className="py-3 px-4 text-sm text-right">
                      {purchase.quantity}
                    </td>

                    <td className="py-3 px-4 text-sm text-right">
                      ₹{purchase.purchasePrice}
                    </td>

                    <td className="py-3 px-4 text-sm text-right">
                      ₹{purchase.purchasePrice * purchase.quantity}
                    </td>

                    <td className="py-3 px-4 text-center">

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </td>

                  </tr>

                );

              })}

          </tbody>

        </table>

        {purchases.length === 0 && (

          <div className="py-12 text-center border-t border-dashed">

            <p className="text-sm text-muted-foreground">
              No purchases recorded yet.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}