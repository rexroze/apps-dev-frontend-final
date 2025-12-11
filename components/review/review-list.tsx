"use client";

import { useState, useEffect } from "react";
import { Review } from "@/types/review";
import { StarRating } from "./star-rating";
import { getReviewsByProduct } from "@/services/review";
import { Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface ReviewListProps {
  productId: string;
  highlightCount?: number;
}

export function ReviewList({ productId, highlightCount = 3 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"createdAt" | "rating">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId, filterRating, sortBy, sortOrder]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await getReviewsByProduct(productId, {
        rating: filterRating,
        sortBy,
        sortOrder,
        limit: showAll ? undefined : highlightCount,
      });
      setReviews(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, highlightCount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterRating === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRating(undefined)}
          >
            All
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={filterRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(rating)}
              className="flex items-center gap-1"
            >
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {rating}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "createdAt" | "rating")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filterRating !== undefined ? (
            <p>No {filterRating}-star reviews found. Try selecting a different rating or view all reviews.</p>
          ) : (
            <p>No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{review.user.name || "Anonymous"}</p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{review.comment}</p>
                )}
              </div>
            ))}
          </div>

          {reviews.length > highlightCount && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show Less" : `Show All Reviews (${reviews.length})`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

