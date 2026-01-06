"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Validate UUID
const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

/**
 * Create or get existing conversation between two users
 * Ensures user1Id < user2Id for consistent unique constraint
 */
export async function createOrGetConversation(user1Id: string, user2Id: string) {
  if (!isValidUUID(user1Id) || !isValidUUID(user2Id)) {
    return { success: false, error: "Invalid user ID format" };
  }

  if (user1Id === user2Id) {
    return { success: false, error: "Cannot create conversation with yourself" };
  }

  try {
    // Ensure consistent ordering: smaller ID is always user1Id
    const [firstUserId, secondUserId] = 
      user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    // Try to find existing conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: firstUserId,
          user2Id: secondUserId,
        },
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Create if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: firstUserId,
          user2Id: secondUserId,
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    }

    // Determine the other user (not the current user)
    const otherUser = 
      conversation.user1Id === user1Id ? conversation.user2 : conversation.user1;

    return {
      success: true,
      conversation: {
        ...conversation,
        otherUser,
      },
    };
  } catch (error) {
    console.error("Create/Get Conversation Error:", error);
    return { success: false, error: "Failed to create or get conversation" };
  }
}

/**
 * Get all conversations for a user
 * Returns conversations with last message preview and unread count
 */
export async function getConversations(userId: string) {
  if (!isValidUUID(userId)) {
    return { success: false, error: "Invalid user ID format", conversations: [] };
  }

  try {
    // Get conversations where user is either user1 or user2
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: {
                  not: userId, // Only count unread messages from other user
                },
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    // Transform to include other user info and unread count
    const transformedConversations = conversations.map((conv) => {
      const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0] || null;
      const unreadCount = conv._count.messages;

      return {
        id: conv.id,
        otherUser,
        lastMessage,
        lastMessageAt: conv.lastMessageAt,
        lastMessagePreview: conv.lastMessagePreview,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    return {
      success: true,
      conversations: transformedConversations,
    };
  } catch (error) {
    console.error("Get Conversations Error:", error);
    return { success: false, error: "Failed to fetch conversations", conversations: [] };
  }
}

/**
 * Get a specific conversation by ID
 * Verifies that the user is part of the conversation
 */
export async function getConversation(conversationId: string, userId: string) {
  if (!isValidUUID(conversationId) || !isValidUUID(userId)) {
    return { success: false, error: "Invalid ID format" };
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    // Verify user is part of conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return { success: false, error: "Unauthorized access to conversation" };
    }

    // Determine the other user
    const otherUser = 
      conversation.user1Id === userId ? conversation.user2 : conversation.user1;

    return {
      success: true,
      conversation: {
        ...conversation,
        otherUser,
      },
    };
  } catch (error) {
    console.error("Get Conversation Error:", error);
    return { success: false, error: "Failed to fetch conversation" };
  }
}
