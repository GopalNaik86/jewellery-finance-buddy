import { Product, Purchase, Sale } from "./types";

const STORAGE_KEYS = {
  products: "inv_products",
  purchases: "inv_purchases",
  sales: "inv_sales",
};

function load<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Products
export function getProducts(): Product[] {
  return load<Product>(STORAGE_KEYS.products);
}

export function addProduct(product: Omit<Product, "id" | "createdAt">): Product {
  const products = getProducts();
  const newProduct: Product = { ...product, id: generateId(), createdAt: new Date().toISOString() };
  products.push(newProduct);
  save(STORAGE_KEYS.products, products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  save(STORAGE_KEYS.products, products);
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  save(STORAGE_KEYS.products, filtered);
  return true;
}

// Purchases
export function getPurchases(): Purchase[] {
  return load<Purchase>(STORAGE_KEYS.purchases);
}

export function addPurchase(purchase: Omit<Purchase, "id" | "createdAt">): Purchase {
  const purchases = getPurchases();
  const newPurchase: Purchase = { ...purchase, id: generateId(), createdAt: new Date().toISOString() };
  purchases.push(newPurchase);
  save(STORAGE_KEYS.purchases, purchases);
  return newPurchase;
}

export function deletePurchase(id: string): boolean {
  const purchases = getPurchases();
  const filtered = purchases.filter((p) => p.id !== id);
  if (filtered.length === purchases.length) return false;
  save(STORAGE_KEYS.purchases, filtered);
  return true;
}

// Sales
export function getSales(): Sale[] {
  return load<Sale>(STORAGE_KEYS.sales);
}

export function addSale(sale: Omit<Sale, "id" | "createdAt">): Sale {
  const sales = getSales();
  const newSale: Sale = { ...sale, id: generateId(), createdAt: new Date().toISOString() };
  sales.push(newSale);
  save(STORAGE_KEYS.sales, sales);
  return newSale;
}

export function deleteSale(id: string): boolean {
  const sales = getSales();
  const filtered = sales.filter((s) => s.id !== id);
  if (filtered.length === sales.length) return false;
  save(STORAGE_KEYS.sales, filtered);
  return true;
}

// Stock calculation
export function getProductStock(productId: string): number {
  const purchases = getPurchases().filter((p) => p.productId === productId);
  const sales = getSales().filter((s) => s.productId === productId);
  const totalPurchased = purchases.reduce((sum, p) => sum + p.quantity, 0);
  const totalSold = sales.reduce((sum, s) => sum + s.quantity, 0);
  return totalPurchased - totalSold;
}

// Today helpers
export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr.startsWith(today);
}

export function getTodaySales(): Sale[] {
  return getSales().filter((s) => isToday(s.date));
}

export function getTodayProfit(): number {
  const todaySales = getTodaySales();
  const products = getProducts();
  return todaySales.reduce((total, sale) => {
    const product = products.find((p) => p.id === sale.productId);
    if (!product) return total;
    return total + (sale.sellingPrice - product.purchasePrice) * sale.quantity;
  }, 0);
}

export function getBestSellingProduct(): { product: Product; totalSold: number } | null {
  const products = getProducts();
  const sales = getSales();
  if (products.length === 0 || sales.length === 0) return null;

  const salesByProduct: Record<string, number> = {};
  sales.forEach((s) => {
    salesByProduct[s.productId] = (salesByProduct[s.productId] || 0) + s.quantity;
  });

  const bestId = Object.entries(salesByProduct).sort(([, a], [, b]) => b - a)[0];
  if (!bestId) return null;
  const product = products.find((p) => p.id === bestId[0]);
  if (!product) return null;
  return { product, totalSold: bestId[1] };
}
