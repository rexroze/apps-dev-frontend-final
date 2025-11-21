export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  status: "active" | "inactive" | "draft";
  stock: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}