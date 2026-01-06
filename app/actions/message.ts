"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/app/actions/notification";

// Validate UUID
const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachments?: string[]
) {
  if (!isValidUUID(conversationId) || !isValidUUID(senderId)) {
    return { success: false, error: "Invalid ID format" };
  }

  if (!content || content.trim().length === 0) {
    return { success: false, error: "Message content cannot be empty" };
  }

  try {
    // Verify conversation exists and user is part of it
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      return { success: false, error: "Unauthorized: You are not part of this conversation" };
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        attachments: attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update conversation's last message preview and timestamp
    const preview = content.length > 100 ? content.substring(0, 100) + "..." : content;
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessagePreview: preview,
        lastMessageAt: new Date(),
      },
    });

    // Notify recipient about new message
    const recipientId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;
    const recipient = conversation.user1Id === senderId ? conversation.user2 : conversation.user1;
    
    await createNotification(
      recipientId,
      "MESSAGE",
      "New Message",
      `${message.sender.username}: ${content.length > 50 ? content.substring(0, 50) + "..." : content}`,
      senderId,
      conversationId,
      "CONVERSATION",
      { senderUsername: message.sender.username }
    );

    // Revalidate messages pages
    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);

    // Convert BigInt ID to string for JSON serialization
    const serializedMessage = {
      ...message,
      id: message.id.toString(),
    };

    return {
      success: true,
      message: serializedMessage,
    };
  } catch (error) {
    console.error("Send Message Error:", error);
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Get messages for a conversation with pagination
 * Uses cursor-based pagination with message ID
 */
export async function getMessages(
  conversationId: string,
  userId: string,
  limit: number = 50,
  cursor?: string
) {
  if (!isValidUUID(conversationId) || !isValidUUID(userId)) {
    return { success: false, error: "Invalid ID format", messages: [] };
  }

  try {
    // Verify conversation exists and user is part of it
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found", messages: [] };
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return { success: false, error: "Unauthorized access", messages: [] };
    }

    // Build query with cursor pagination
    const where: any = {
      conversationId,
    };

    if (cursor) {
      where.id = {
        lt: BigInt(cursor), // Less than cursor (for reverse chronological order)
      };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        id: "desc", // Most recent first
      },
      take: limit + 1, // Take one extra to check if there are more
    });

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const actualMessages = hasMore ? messages.slice(0, limit) : messages;

    // Reverse to show oldest first (for display)
    const reversedMessages = actualMessages.reverse();

    // Get next cursor (oldest message ID)
    const nextCursor = reversedMessages.length > 0 
      ? reversedMessages[0].id.toString() 
      : undefined;

    // Convert BigInt IDs to strings for JSON serialization
    const serializedMessages = reversedMessages.map((msg) => ({
      ...msg,
      id: msg.id.toString(),
    }));

    return {
      success: true,
      messages: serializedMessages,
      nextCursor,
      hasMore,
    };
  } catch (error) {
    console.error("Get Messages Error:", error);
    return { success: false, error: "Failed to fetch messages", messages: [] };
  }
}

/**
 * Mark messages as read
 */
export async function markAsRead(messageIds: string[], userId: string) {
  if (!isValidUUID(userId)) {
    return { success: false, error: "Invalid user ID format" };
  }

  if (!messageIds || messageIds.length === 0) {
    return { success: true };
  }

  try {
    // Convert string IDs to BigInt
    const bigIntIds = messageIds.map((id) => BigInt(id));

    // Update messages - only mark as read if they're not from the current user
    await prisma.message.updateMany({
      where: {
        id: {
          in: bigIntIds,
        },
        senderId: {
          not: userId, // Don't mark own messages as read
        },
        conversation: {
          OR: [
            { user1Id: userId },
            { user2Id: userId },
          ],
        },
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/messages");
    revalidatePath("/messages/[conversationId]", "page");

    return { success: true };
  } catch (error) {
    console.error("Mark As Read Error:", error);
    return { success: false, error: "Failed to mark messages as read" };
  }
}

/**
 * Get unread message count for a user across all conversations
 */
export async function getUnreadCount(userId: string) {
  if (!isValidUUID(userId)) {
    return { success: false, error: "Invalid user ID format", count: 0 };
  }

  try {
    const count = await prisma.message.count({
      where: {
        isRead: false,
        senderId: {
          not: userId, // Only count messages from others
        },
        conversation: {
          OR: [
            { user1Id: userId },
            { user2Id: userId },
          ],
        },
      },
    });

    return {
      success: true,
      count,
    };
  } catch (error) {
    console.error("Get Unread Count Error:", error);
    return { success: false, error: "Failed to get unread count", count: 0 };
  }
}
