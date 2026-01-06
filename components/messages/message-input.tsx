"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { sendMessage } from "@/app/actions/message";

interface MessageInputProps {
  conversationId: string;
  senderId: string;
  onMessageSent?: () => void;
}

export function MessageInput({ conversationId, senderId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const result = await sendMessage(conversationId, senderId, content.trim());
      
      if (result.success) {
        setContent("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
        onMessageSent?.();
      } else {
        alert(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (but allow Shift+Enter for new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="p-3 sm:p-4">
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[44px] max-h-[120px] resize-none text-sm border-gray-200 focus:border-[#31BF75] focus:ring-1 focus:ring-[#31BF75] rounded-xl"
              disabled={sending}
            />
            {!content && (
              <div className="absolute bottom-2.5 right-3 text-[10px] text-gray-400 pointer-events-none">
                Press Enter to send
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={!content.trim() || sending}
            size="icon"
            className="h-[44px] w-[44px] rounded-xl bg-gradient-to-br from-[#31BF75] to-[#27995E] hover:from-[#27995E] hover:to-[#207C4C] text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
