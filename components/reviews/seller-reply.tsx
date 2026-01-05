"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addSellerReply } from "@/app/actions/review";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SellerReplyProps {
  reviewId: string;
  sellerId: string;
  existingReply?: string | null;
  replyDate?: string | null;
  onReplyAdded?: () => void;
}

export function SellerReply({
  reviewId,
  sellerId,
  existingReply,
  replyDate,
  onReplyAdded,
}: SellerReplyProps) {
  const [reply, setReply] = useState(existingReply || "");
  const [isEditing, setIsEditing] = useState(!existingReply);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reply.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await addSellerReply(reviewId, sellerId, reply.trim());

      if (result.success) {
        setIsEditing(false);
        if (onReplyAdded) {
          onReplyAdded();
        }
      } else {
        setError(result.error || "Failed to add reply");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing && existingReply) {
    return (
      <div className="mt-4 pl-4 border-l-4 border-[#31BF75] bg-teal-50/50 rounded-r-lg p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#31BF75]" />
            <span className="text-sm font-semibold text-[#31BF75]">Seller's Reply</span>
          </div>
          {replyDate && (
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(replyDate), { addSuffix: true })}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{existingReply}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="mt-2 text-[#31BF75] hover:text-[#27995E]"
        >
          Edit Reply
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <Label htmlFor="reply" className="text-sm font-semibold">
          Your Reply
        </Label>
        <Textarea
          id="reply"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Thank the buyer for their feedback..."
          className="min-h-24 mt-1"
          disabled={loading}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 text-right mt-1">
          {reply.length}/500 characters
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading || !reply.trim()}
          size="sm"
          className="bg-[#31BF75] hover:bg-[#27995E]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {existingReply ? "Update Reply" : "Send Reply"}
            </>
          )}
        </Button>
        {existingReply && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              setReply(existingReply);
              setError(null);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

