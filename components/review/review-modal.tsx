"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewForm } from "./review-form";
import { StarRating } from "./star-rating";
import { getUserReviewByOrderItem } from "@/services/review";
import { Review } from "@/types/review";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2 } from "lucide-react";

interface ReviewModalProps {
  productId: string;
  orderItemId: string;
  productName: string;
  productImage?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReviewModal({
  productId,
  orderItemId,
  productName,
  productImage,
  open,
  onOpenChange,
  onSuccess,
}: ReviewModalProps) {
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadUserReview();
    }
  }, [open, orderItemId]);

  const loadUserReview = async () => {
    setIsLoading(true);
    try {
      const review = await getUserReviewByOrderItem(orderItemId);
      setExistingReview(review);
    } catch (error) {
      setExistingReview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    loadUserReview();
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Product</DialogTitle>
          <DialogDescription>
            Share your experience with this product
          </DialogDescription>
        </DialogHeader>

        {/* Product Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 object-contain rounded"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{productName}</h3>
            {existingReview && (
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">You've already reviewed this product</span>
                <StarRating rating={existingReview.rating} size="sm" />
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="w-6 h-6" />
          </div>
        ) : (
          <ReviewForm
            productId={productId}
            orderItemId={orderItemId}
            onSuccess={() => {
              handleSuccess();
              // Don't close automatically, let user close manually
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

