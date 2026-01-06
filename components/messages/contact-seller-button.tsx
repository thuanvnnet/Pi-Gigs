"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { createOrGetConversation } from "@/app/actions/conversation";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";

interface ContactSellerButtonProps {
  sellerId: string;
  sellerUsername: string;
  className?: string;
}

export function ContactSellerButton({ sellerId, sellerUsername, className }: ContactSellerButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    if (!user) {
      alert("Please login to contact the seller");
      return;
    }

    if (user.id === sellerId) {
      alert("You cannot contact yourself");
      return;
    }

    setLoading(true);
    try {
      const result = await createOrGetConversation(user.id, sellerId);
      
      if (result.success && result.conversation) {
        router.push(`/messages/${result.conversation.id}`);
      } else {
        alert(result.error || "Failed to start conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to start conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleContact}
      disabled={loading || !user || user.id === sellerId}
      className={`group relative overflow-hidden bg-gradient-to-r from-[#31BF75] to-[#27995E] text-white border-0 shadow-md hover:shadow-lg hover:shadow-[#31BF75]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-medium ${className}`}
      variant="default"
      size="default"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Starting...</span>
        </>
      ) : (
        <>
          <MessageCircle className="mr-2 h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
          <span className="relative z-10">Message</span>
          {/* Shine effect on hover */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
        </>
      )}
    </Button>
  );
}
