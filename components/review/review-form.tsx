"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { Star } from "lucide-react";
import { createReview, updateReview, deleteReview, getUserReview, getUserReviewByOrderItem } from "@/services/review";
import { toast } from "sonner";
import { Review } from "@/types/review";

interface ReviewFormProps {
  productId: string;
  orderItemId?: string; // Optional - if provided, review is specific to this order item
  onSuccess?: () => void;
}

export function ReviewForm({ productId, orderItemId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    loadUserReview();
  }, [productId, orderItemId]);

  const loadUserReview = async () => {
    try {
      if (orderItemId) {
        // If orderItemId is provided, get review for that specific order item
        const review = await getUserReviewByOrderItem(orderItemId);
        if (review) {
          setExistingReview(review);
          setRating(review.rating);
          setComment(review.comment || "");
        }
        setCanReview(true); // If orderItemId is provided, user can review
      } else {
        // If no orderItemId, get most recent review for the product
        const review = await getUserReview(productId);
        if (review) {
          setExistingReview(review);
          setRating(review.rating);
          setComment(review.comment || "");
        }
        // For product detail page, we'll check if user can review
        setCanReview(true); // We'll let the backend handle the validation
      }
    } catch (error) {
      // User hasn't reviewed yet, that's fine
      setCanReview(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!orderItemId) {
      toast.error("Cannot review without an order item. Please review from your order history.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateReview(existingReview.id, { rating, comment: comment || undefined });
        toast.success("Review updated successfully");
      } else {
        await createReview({ productId, orderItemId, rating, comment: comment || undefined });
        toast.success("Review submitted successfully");
      }
      setExistingReview(null);
      await loadUserReview();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      await deleteReview(existingReview.id);
      toast.success("Review deleted successfully");
      setExistingReview(null);
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!orderItemId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          To review this product, please visit your <a href="/orders" className="underline font-semibold">Order History</a> and review from there.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review (Optional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
        </Button>
        {existingReview && (
          <Button type="button" variant="outline" onClick={handleDelete}>
            Delete Review
          </Button>
        )}
      </div>
    </form>
  );
}

