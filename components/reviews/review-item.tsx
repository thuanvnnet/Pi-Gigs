"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SellerReply } from "./seller-reply";
import { useAuth } from "@/components/providers/auth-provider";

interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    sellerReply: string | null;
    sellerReplyAt: string | null;
    createdAt: string;
    buyer: {
      username: string;
      avatarUrl: string | null;
    };
  };
  sellerId: string;
  currentUserId?: string | null;
  onReplyAdded?: () => void;
}

export function ReviewItem({
  review,
  sellerId,
  currentUserId,
  onReplyAdded,
}: ReviewItemProps) {
  const { user } = useAuth();
  const isSeller = (user?.id || currentUserId) === sellerId;

  return (
    <div className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={review.buyer.avatarUrl || ""} alt={review.buyer.username} />
          <AvatarFallback className="bg-gray-200 text-gray-700">
            {review.buyer.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-semibold text-gray-900">{review.buyer.username}</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            {review.createdAt && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
          {review.comment && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
          )}
          {review.sellerReply && (
            <div className="mt-4 pl-4 border-l-4 border-[#31BF75] bg-teal-50/50 rounded-r-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#31BF75]" />
                  <span className="text-sm font-semibold text-[#31BF75]">Seller's Reply</span>
                </div>
                {review.sellerReplyAt && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(review.sellerReplyAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.sellerReply}</p>
            </div>
          )}
          {isSeller && !review.sellerReply && (
            <div className="mt-4">
              <SellerReply
                reviewId={review.id}
                sellerId={sellerId}
                onReplyAdded={onReplyAdded}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

