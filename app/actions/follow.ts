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
 * Follow a seller
 */
export async function followSeller(followerId: string, followingId: string) {
  if (!isValidUUID(followerId) || !isValidUUID(followingId)) {
    return { success: false, error: "Invalid user ID format" };
  }

  if (followerId === followingId) {
    return { success: false, error: "Cannot follow yourself" };
  }

  try {
    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return { success: false, error: "Already following this seller" };
    }

    // Get following user info for notification
    const followingUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { username: true },
    });

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Create notification
    if (followingUser) {
      const follower = await prisma.user.findUnique({
        where: { id: followerId },
        select: { username: true },
      });

      if (follower) {
        await createNotification(
          followingId, // recipientId
          "FOLLOW", // type
          "New Follower", // title
          `${follower.username} started following you`, // content
          followerId, // actorId
          followingId, // entityId
          "USER", // entityType
          { followerUsername: follower.username } // metadata
        );
      }
    }

    // Revalidate seller profile page
    revalidatePath(`/seller/${followingId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Follow Seller Error:", error);
    return { success: false, error: error?.message || "Failed to follow seller" };
  }
}

/**
 * Unfollow a seller
 */
export async function unfollowSeller(followerId: string, followingId: string) {
  if (!isValidUUID(followerId) || !isValidUUID(followingId)) {
    return { success: false, error: "Invalid user ID format" };
  }

  try {
    // Delete follow relationship
    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    // Revalidate seller profile page
    revalidatePath(`/seller/${followingId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Unfollow Seller Error:", error);
    return { success: false, error: error?.message || "Failed to unfollow seller" };
  }
}

/**
 * Check if user is following a seller
 */
export async function checkFollowStatus(followerId: string, followingId: string) {
  if (!isValidUUID(followerId) || !isValidUUID(followingId)) {
    return { success: false, isFollowing: false };
  }

  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { success: true, isFollowing: !!follow };
  } catch (error) {
    console.error("Check Follow Status Error:", error);
    return { success: false, isFollowing: false };
  }
}

/**
 * Get followers count for a seller
 */
export async function getFollowersCount(sellerId: string) {
  if (!isValidUUID(sellerId)) {
    return { success: false, count: 0 };
  }

  try {
    const count = await prisma.follow.count({
      where: {
        followingId: sellerId,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Get Followers Count Error:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Get following count for a user
 */
export async function getFollowingCount(userId: string) {
  if (!isValidUUID(userId)) {
    return { success: false, count: 0 };
  }

  try {
    const count = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Get Following Count Error:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Get list of followers for a seller
 */
export async function getFollowers(sellerId: string, limit: number = 20) {
  if (!isValidUUID(sellerId)) {
    return { success: false, followers: [] };
  }

  try {
    const follows = await prisma.follow.findMany({
      where: {
        followingId: sellerId,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const followers = follows.map((follow) => ({
      ...follow.follower,
      followedAt: follow.createdAt.toISOString(),
    }));

    return { success: true, followers };
  } catch (error) {
    console.error("Get Followers Error:", error);
    return { success: false, followers: [] };
  }
}

/**
 * Get list of users that a user is following
 */
export async function getFollowing(userId: string, limit: number = 20) {
  if (!isValidUUID(userId)) {
    return { success: false, following: [] };
  }

  try {
    const follows = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const following = follows.map((follow) => ({
      ...follow.following,
      followedAt: follow.createdAt.toISOString(),
    }));

    return { success: true, following };
  } catch (error) {
    console.error("Get Following Error:", error);
    return { success: false, following: [] };
  }
}
