"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { getConversations } from "@/app/actions/conversation";
import { ConversationList } from "@/components/messages/conversation-list";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    loadConversations();
  }, [user, authLoading]);

  const loadConversations = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getConversations(user.id);
      if (result.success) {
        setConversations(result.conversations || []);
      } else {
        setError(result.error || "Failed to load conversations");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <MessageSquare className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Messages</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={loadConversations}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Chat with buyers and sellers</p>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <ConversationList
            conversations={conversations}
            currentUserId={user?.id || ""}
          />
        </div>
      </div>
    </div>
  );
}
