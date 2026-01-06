"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter, useParams } from "next/navigation";
import { getConversation, getConversations } from "@/app/actions/conversation";
import { getMessages, markAsRead } from "@/app/actions/message";
import { MessageBubble } from "@/components/messages/message-bubble";
import { MessageInput } from "@/components/messages/message-input";
import { ConversationList } from "@/components/messages/conversation-list";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ConversationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.conversationId as string;

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change (only if user is near bottom)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      
      // Only auto-scroll if user is already near the bottom
      if (isNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (conversationId) {
      loadConversation();
      loadMessages();
      loadAllConversations();
      startPolling();
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [user, authLoading, conversationId]);

  // Refetch messages when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (conversationId && user?.id && !loadingMessages) {
        loadMessages(undefined, true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [conversationId, user?.id, loadingMessages]);

  const loadConversation = async () => {
    if (!user?.id || !conversationId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getConversation(conversationId, user.id);
      if (result.success && result.conversation) {
        setConversation(result.conversation);
      } else {
        setError(result.error || "Conversation not found");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const loadAllConversations = async () => {
    if (!user?.id) return;

    try {
      const result = await getConversations(user.id);
      if (result.success) {
        setAllConversations(result.conversations || []);
      }
    } catch (err: any) {
      console.error("Error loading conversations:", err);
    }
  };

  const loadMessages = async (cursor?: string, appendNewOnly = false) => {
    if (!user?.id || !conversationId) return;

    setLoadingMessages(true);

    try {
      const result = await getMessages(conversationId, user.id, 50, cursor);
      if (result.success) {
        if (cursor) {
          // Append older messages (when loading more)
          setMessages((prev) => [...(result.messages || []), ...prev]);
        } else if (appendNewOnly) {
          // Only append new messages that we don't have yet (for polling)
          setMessages((prev) => {
            if (prev.length === 0) {
              // If no messages yet, just set them
              return result.messages || [];
            }
            
            const existingIds = new Set(prev.map((m: any) => m.id));
            const newMessages = (result.messages || []).filter(
              (msg: any) => !existingIds.has(msg.id)
            );
            
            if (newMessages.length > 0) {
              // Auto scroll to bottom when new message arrives
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
              
              return [...prev, ...newMessages];
            }
            
            return prev; // No new messages
          });
        } else {
          // Replace with new messages (initial load or manual refresh)
          setMessages(result.messages || []);
        }
        setHasMore(result.hasMore || false);
        setNextCursor(result.nextCursor);

        // Mark messages as read
        if (result.messages && result.messages.length > 0) {
          const unreadMessageIds = result.messages
            .filter((msg: any) => !msg.isRead && msg.sender.id !== user.id)
            .map((msg: any) => msg.id.toString());
          
          if (unreadMessageIds.length > 0) {
            await markAsRead(unreadMessageIds, user.id);
          }
        }
      }
    } catch (err: any) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleMessageSent = () => {
    // Reload messages after sending
    loadMessages();
  };

  const startPolling = () => {
    // Poll for new messages every 2 seconds when user is actively viewing the conversation
    const interval = setInterval(() => {
      if (!loadingMessages && conversationId && user?.id) {
        // Only append new messages, don't reload everything
        loadMessages(undefined, true);
      }
    }, 2000); // Reduced to 2 seconds for faster updates

    setPollingInterval(interval);
  };

  const loadMoreMessages = () => {
    if (hasMore && nextCursor && !loadingMessages) {
      loadMessages(nextCursor);
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

  if (error || !conversation) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/messages">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </Link>
        <div className="text-center py-20">
          <MessageSquare className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Conversation Not Found</h3>
          <p className="text-gray-500 mb-6">{error || "This conversation does not exist or you don't have access to it."}</p>
          <Link href="/messages">
            <Button>Back to Messages</Button>
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = conversation.otherUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar - Conversations List (hidden on mobile) */}
          <div className="hidden lg:block">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={allConversations}
                  currentUserId={user?.id || ""}
                  currentConversationId={conversationId}
                />
              </div>
            </div>
          </div>

          {/* Main Content - Messages */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm flex flex-col h-[calc(100vh-3rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href="/messages" className="lg:hidden">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                  <div className="relative">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-gray-100">
                      <AvatarImage src={otherUser.avatarUrl || ""} alt={otherUser.username} />
                      <AvatarFallback className="bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white font-medium text-sm">
                        {otherUser.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-white rounded-full flex items-center justify-center border border-gray-200">
                      <div className="h-2 w-2 bg-[#31BF75] rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm sm:text-base">{otherUser.username}</h2>
                    <p className="text-xs text-gray-500 hidden sm:block">Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 bg-gradient-to-b from-gray-50/50 to-white"
              >
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-[#31BF75]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#31BF75]/10 to-[#27995E]/10 flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-[#31BF75]" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">No messages yet</p>
                    <p className="text-sm text-gray-400">Start the conversation by sending a message!</p>
                  </div>
                ) : (
                  <>
                    {hasMore && (
                      <div className="text-center mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadMoreMessages}
                          disabled={loadingMessages}
                          className="text-xs text-gray-500 hover:text-gray-700 h-7"
                        >
                          {loadingMessages ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          ) : null}
                          Load older messages
                        </Button>
                      </div>
                    )}
                    <div className="space-y-1">
                      {messages.map((message, index) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          currentUserId={user?.id || ""}
                          isLastMessage={index === messages.length - 1}
                        />
                      ))}
                    </div>
                    <div ref={messagesEndRef} className="h-1" />
                  </>
                )}
              </div>

              {/* Message Input */}
              <MessageInput
                conversationId={conversationId}
                senderId={user?.id || ""}
                onMessageSent={handleMessageSent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
