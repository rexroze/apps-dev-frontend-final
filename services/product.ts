import { api } from "@/lib/axios";
import { CreateProductData, UpdateProductData } from "@/types/product";

export const getProductListService = async (userId: string) => {
  const response = await api.post("/api/product/v1/product-list", {
    userId,
  });
  return response.data;
};

export const createProductService = async (data: CreateProductData) => {
  const response = await api.post("/api/product/v1/product-create", data);
  return response.data;
};

export const updateProductService = async (data: UpdateProductData) => {
  const response = await api.post("/api/product/v1/product-update", data);
  return response.data;
};

export interface SoftDeleteProductData {
  id: string;
  userId: string;
}

export const softDeleteProductService = async (data: SoftDeleteProductData) => {
  const response = await api.post("/api/product/v1/product-soft-delete", data);
  return response.data;
};

export const restoreProductService = async (data: SoftDeleteProductData) => {
  const response = await api.post("/api/product/v1/product-restore", data);
  return response.data;
};

export const hardDeleteProductService = async (data: SoftDeleteProductData) => {
  const response = await api.post("/api/product/v1/product-hard-delete", data);
  return response.data;
};

export const getActiveProductsService = async (opts?: { search?: string; categoryId?: string; page?: number; limit?: number }) => {
  const params: any = {};
  if (opts?.search) params.search = opts.search;
  if (opts?.categoryId) params.categoryId = opts.categoryId;
  if (opts?.page) params.page = opts.page;
  if (opts?.limit) params.limit = opts.limit;

  const response = await api.get("/api/product/v1/product-active-list", { params });
  return response.data;
};

export const getProductByIdService = async (id: string) => {
  const response = await api.post("/api/product/v1/product-get-by-id", { id });
  return response.data;
};