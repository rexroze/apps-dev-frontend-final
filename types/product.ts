export interface ProductListResponse {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  userId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

export interface UpdateProductData {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}