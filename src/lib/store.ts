
import { Product, Purchase, Sale } from "./types";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";

// PRODUCTS

export async function getProducts(): Promise<Product[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "products"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

export async function addProduct(product: Omit<Product, "id" | "createdAt">) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const docRef = await addDoc(collection(db, "products"), {
    ...product,
    userId: user.uid,
    createdAt: new Date().toISOString(),
  });

  return { id: docRef.id, ...product };
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, "products", id));
}

// PURCHASES

export async function getPurchases(): Promise<Purchase[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "purchases"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Purchase[];
}

export async function addPurchase(purchase: Omit<Purchase, "id" | "createdAt">) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const docRef = await addDoc(collection(db, "purchases"), {
    ...purchase,
    userId: user.uid,
    createdAt: new Date().toISOString(),
  });

  return { id: docRef.id, ...purchase };
}

export async function deletePurchase(id: string) {
  await deleteDoc(doc(db, "purchases", id));
}

// SALES

export async function getSales(): Promise<Sale[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "sales"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sale[];
}

export async function addSale(sale: Omit<Sale, "id" | "createdAt">) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const docRef = await addDoc(collection(db, "sales"), {
    ...sale,
    userId: user.uid,
    createdAt: new Date().toISOString(),
  });

  return { id: docRef.id, ...sale };
}

export async function deleteSale(id: string) {
  await deleteDoc(doc(db, "sales", id));
}

// STOCK

export async function getProductStock(productId: string): Promise<number> {
  const purchases = await getPurchases();
  const sales = await getSales();

  const totalPurchased = purchases
    .filter((p) => p.productId === productId)
    .reduce((sum, p) => sum + p.quantity, 0);

  const totalSold = sales
    .filter((s) => s.productId === productId)
    .reduce((sum, s) => sum + s.quantity, 0);

  return totalPurchased - totalSold;
}

