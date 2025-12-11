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
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  averageRating?: number;
  totalReviews?: number;
  soldCount?: number;
}

export interface ProductDetailResponse {
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
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  averageRating?: number;
  totalReviews?: number;
  soldCount?: number;
}

export interface CreateProductData {
  userId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId?: string;
}

export interface UpdateProductData {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId?: string;
}