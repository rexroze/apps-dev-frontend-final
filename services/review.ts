import { api } from "@/lib/axios";
import { Review, ReviewStats, CreateReviewData, UpdateReviewData } from "@/types/review";

export async function getReviewsByProduct(
  productId: string,
  options?: {
    rating?: number;
    sortBy?: "createdAt" | "rating";
    sortOrder?: "asc" | "desc";
    limit?: number;
  }
): Promise<Review[]> {
  const params = new URLSearchParams();
  if (options?.rating) params.set("rating", options.rating.toString());
  if (options?.sortBy) params.set("sortBy", options.sortBy);
  if (options?.sortOrder) params.set("sortOrder", options.sortOrder);
  if (options?.limit) params.set("limit", options.limit.toString());

  const response = await api.get(`/api/review/v1/product/${productId}?${params.toString()}`);
  if (response.data.status === "success") {
    return response.data.data;
  }
  throw new Error(response.data.message || "Failed to fetch reviews");
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const response = await api.get(`/api/review/v1/product/${productId}/stats`);
  if (response.data.status === "success") {
    return response.data.data;
  }
  throw new Error(response.data.message || "Failed to fetch review stats");
}

export async function getUserReview(productId: string): Promise<Review | null> {
  const response = await api.get(`/api/review/v1/product/${productId}/user`);
  if (response.data.status === "success") {
    return response.data.data;
  }
  if (response.status === 404) {
    return null;
  }
  throw new Error(response.data.message || "Failed to fetch user review");
}

export async function getUserReviewByOrderItem(orderItemId: string): Promise<Review | null> {
  try {
    const response = await api.get(`/api/review/v1/order-item/${orderItemId}/user`);
    if (response.data.status === "success") {
      return response.data.data;
    }
    return null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || "Failed to fetch user review");
  }
}

export async function createReview(data: CreateReviewData): Promise<Review> {
  const response = await api.post("/api/review/v1", data);
  if (response.data.status === "success") {
    return response.data.data;
  }
  throw new Error(response.data.message || "Failed to create review");
}

export async function updateReview(reviewId: string, data: UpdateReviewData): Promise<Review> {
  const response = await api.put(`/api/review/v1/${reviewId}`, data);
  if (response.data.status === "success") {
    return response.data.data;
  }
  throw new Error(response.data.message || "Failed to update review");
}

export async function deleteReview(reviewId: string): Promise<void> {
  const response = await api.delete(`/api/review/v1/${reviewId}`);
  if (response.data.status !== "success") {
    throw new Error(response.data.message || "Failed to delete review");
  }
}

