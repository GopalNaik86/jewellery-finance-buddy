export interface Product {
  id: string;
  name: string;
  //category: string;
  size?: string;
  color?: string;
  purchasePrice: number;
  sellingPrice: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  productId: string;
  quantity: number;
  purchasePrice: number;
  date: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  sellingPrice: number;
  date: string;
  createdAt: string;
}

//export const CATEGORIES = ["Shirt", "Pant", "Saree", "T-Shirt", "Kurta", "Jeans", "Jacket", "Other"] as const;
export const SIZES = ["S", "M", "L", "XL", "XXL", "Free Size"] as const;
