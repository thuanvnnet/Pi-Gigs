"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string | null;
    attachments?: any;
    isRead: boolean;
    createdAt: Date | string;
    sender: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
  };
  currentUserId: string;
  isLastMessage?: boolean;
}

export function MessageBubble({ message, currentUserId, isLastMessage }: MessageBubbleProps) {
  const isOwnMessage = message.sender.id === currentUserId;
  const messageDate = new Date(message.createdAt);

  return (
    <div
      className={cn(
        "flex gap-2.5 mb-3 group",
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar - only show for other user's messages */}
      {!isOwnMessage && (
        <div className="relative flex-shrink-0 mt-0.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender.avatarUrl || ""} alt={message.sender.username} />
            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 text-xs font-medium">
              {message.sender.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Online Status Indicator */}
          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-white rounded-full flex items-center justify-center border border-gray-200">
            <div className="h-2 w-2 bg-[#31BF75] rounded-full"></div>
          </div>
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[75%] sm:max-w-[65%]",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        {/* Sender name and timestamp - only for other user */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 px-1.5 mb-0.5">
            <span className="text-xs font-medium text-gray-600">
              {message.sender.username}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatDistanceToNow(messageDate, { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 break-words shadow-sm transition-all duration-200",
            isOwnMessage
              ? "bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white rounded-br-md"
              : "bg-white border border-gray-100 text-gray-900 rounded-bl-md hover:border-gray-200"
          )}
        >
          {message.content && (
            <p className={cn(
              "text-sm whitespace-pre-wrap leading-relaxed",
              isOwnMessage ? "text-white" : "text-gray-800"
            )}>
              {message.content}
            </p>
          )}

          {/* Attachments placeholder */}
          {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {message.attachments.map((attachment: any, index: number) => (
                <div key={index} className={cn(
                  "text-xs flex items-center gap-1.5",
                  isOwnMessage ? "text-white/80" : "text-gray-500"
                )}>
                  <span>📎</span>
                  <span>{attachment.name || "Attachment"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Read status and timestamp for own messages */}
        {isOwnMessage && (
          <div className="flex items-center gap-1.5 px-1.5 mt-0.5">
            <span className="text-[10px] text-gray-400">
              {formatDistanceToNow(messageDate, { addSuffix: true })}
            </span>
            {isLastMessage && (
              <span className={cn(
                "text-[10px] flex items-center",
                message.isRead ? "text-blue-500" : "text-gray-400"
              )}>
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
