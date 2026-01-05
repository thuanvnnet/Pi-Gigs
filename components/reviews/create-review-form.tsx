"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { createReview } from "@/app/actions/review";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateReviewFormProps {
  orderId: string;
  buyerId: string;
  gigTitle: string;
  onSuccess?: () => void;
}

export function CreateReviewForm({
  orderId,
  buyerId,
  gigTitle,
  onSuccess,
}: CreateReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createReview(
        orderId,
        buyerId,
        rating,
        comment.trim() || undefined
      );

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/dashboard/orders/${orderId}`);
          router.refresh();
        }
      } else {
        setError(result.error || "Failed to create review");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gig Info */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-1">Reviewing</p>
        <p className="font-semibold text-gray-900">{gigTitle}</p>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label htmlFor="rating" className="text-base font-semibold">
          Rating <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              disabled={loading}
            >
              <Star
                className={cn(
                  "h-10 w-10 transition-colors",
                  (hoverRating >= star || rating >= star)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-300"
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-600">
              {rating} {rating === 1 ? "star" : "stars"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Comment (Optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this service..."
          className="min-h-32"
          disabled={loading}
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 text-right">
          {comment.length}/1000 characters
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading || rating === 0}
          className="flex-1 bg-[#31BF75] hover:bg-[#27995E]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </form>
  );
}

