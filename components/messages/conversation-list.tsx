"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    id: string;
    content: string | null;
    createdAt: Date | string;
    sender: {
      id: string;
      username: string;
    };
  } | null;
  lastMessageAt: Date | string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  currentConversationId?: string;
}

export function ConversationList({
  conversations,
  currentUserId,
  currentConversationId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-gray-500 mb-2">No conversations yet</p>
        <p className="text-sm text-gray-400">
          Start a conversation by messaging a seller or buyer
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {conversations.map((conversation) => {
        const isActive = conversation.id === currentConversationId;
        const lastMessageDate = conversation.lastMessageAt
          ? new Date(conversation.lastMessageAt)
          : null;
        const preview = conversation.lastMessagePreview || conversation.lastMessage?.content || "No messages yet";
        const isLastMessageFromOther = conversation.lastMessage?.sender.id !== currentUserId;

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={cn(
              "block px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-gray-50/80 transition-all duration-200 rounded-lg mx-2 my-1",
              isActive && "bg-gradient-to-r from-[#31BF75]/10 to-transparent border-l-2 border-[#31BF75]"
            )}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border border-gray-100">
                  <AvatarImage
                    src={conversation.otherUser.avatarUrl || ""}
                    alt={conversation.otherUser.username}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 text-xs font-medium">
                    {conversation.otherUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <div className="h-2 w-2 bg-[#31BF75] rounded-full"></div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3
                    className={cn(
                      "font-semibold text-sm text-gray-900 truncate",
                      isActive && "text-[#31BF75]"
                    )}
                  >
                    {conversation.otherUser.username}
                  </h3>
                  {lastMessageDate && (
                    <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(lastMessageDate, { addSuffix: true })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-xs sm:text-sm text-gray-600 truncate flex-1 leading-snug",
                      conversation.unreadCount > 0 && isLastMessageFromOther && "font-medium text-gray-900"
                    )}
                  >
                    {preview.length > 50 ? preview.substring(0, 50) + "..." : preview}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-[#31BF75] to-[#27995E] text-white text-[10px] font-bold flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full"
                    >
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
