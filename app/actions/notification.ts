"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Validate UUID
const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

/**
 * Create a notification
 */
export async function createNotification(
  recipientId: string,
  type: string,
  title: string,
  content?: string,
  actorId?: string,
  entityId?: string,
  entityType?: string,
  metadata?: Record<string, any>
) {
  if (!isValidUUID(recipientId)) {
    return { success: false, error: "Invalid recipient ID format" };
  }

  if (actorId && !isValidUUID(actorId)) {
    return { success: false, error: "Invalid actor ID format" };
  }

  if (entityId && !isValidUUID(entityId)) {
    return { success: false, error: "Invalid entity ID format" };
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        recipientId,
        actorId: actorId || null,
        type,
        title,
        content: content || null,
        entityId: entityId || null,
        entityType: entityType || null,
        metadata: metadata || {},
      },
    });

    // Revalidate notifications pages
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      notification,
    };
  } catch (error) {
    console.error("Create Notification Error:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

/**
 * Get notifications for a user with pagination
 */
export async function getNotifications(
  userId: string,
  limit: number = 20,
  cursor?: string
) {
  if (!isValidUUID(userId)) {
    return { success: false, error: "Invalid user ID format", notifications: [] };
  }

  try {
    const where: any = {
      recipientId: userId,
    };

    if (cursor) {
      where.id = {
        lt: cursor, // Less than cursor (for reverse chronological order)
      };
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1, // Take one extra to check if there are more
    });

    // Check if there are more notifications
    const hasMore = notifications.length > limit;
    const actualNotifications = hasMore ? notifications.slice(0, limit) : notifications;

    // Get next cursor (oldest notification ID)
    const nextCursor = actualNotifications.length > 0
      ? actualNotifications[actualNotifications.length - 1].id
      : undefined;

    return {
      success: true,
      notifications: actualNotifications,
      nextCursor,
      hasMore,
    };
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return { success: false, error: "Failed to fetch notifications", notifications: [] };
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  if (!isValidUUID(notificationId) || !isValidUUID(userId)) {
    return { success: false, error: "Invalid ID format" };
  }

  try {
    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    if (notification.recipientId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/dashboard/notifications");

    return { success: true };
  } catch (error) {
    console.error("Mark As Read Error:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  if (!isValidUUID(userId)) {
    return { success: false, error: "Invalid user ID format" };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/dashboard/notifications");

    return { success: true };
  } catch (error) {
    console.error("Mark All As Read Error:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string) {
  if (!isValidUUID(userId)) {
    return { success: false, error: "Invalid user ID format", count: 0 };
  }

  try {
    const count = await prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
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
