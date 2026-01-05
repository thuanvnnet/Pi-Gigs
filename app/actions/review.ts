// app/actions/review.ts
"use server";

import prisma from "@/lib/prisma";

// Validate UUID bằng regex
const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

// Create review after order completion
export async function createReview(
  orderId: string,
  buyerId: string,
  rating: number,
  comment?: string
) {
  try {
    if (!isValidUUID(orderId) || !isValidUUID(buyerId)) {
      return { success: false, error: "Invalid IDs" };
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Get order to verify access and completion
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: buyerId,
        status: "COMPLETED",
      },
      include: {
        gig: {
          select: {
            id: true,
            sellerId: true,
          },
        },
        review: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found, not completed, or access denied" };
    }

    // Check if review already exists
    if (order.review) {
      return { success: false, error: "Review already exists for this order" };
    }

    // Create review and update ratings in a transaction
    const result = await prisma.$transaction(async (prismaTx) => {
      // 1. Create review
      const review = await prismaTx.review.create({
        data: {
          orderId: orderId,
          gigId: order.gig.id,
          buyerId: buyerId,
          sellerId: order.gig.sellerId,
          rating: rating,
          comment: comment?.trim() || null,
        },
      });

      // 2. Update gig rating
      const gigReviews = await prismaTx.review.findMany({
        where: { gigId: order.gig.id },
        select: { rating: true },
      });

      const gigRatingAvg =
        gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length;

      await prismaTx.gig.update({
        where: { id: order.gig.id },
        data: {
          ratingAvg: gigRatingAvg,
          ratingCount: gigReviews.length,
        },
      });

      // 3. Update seller rating
      const sellerReviews = await prismaTx.review.findMany({
        where: { sellerId: order.gig.sellerId },
        select: { rating: true },
      });

      const sellerRatingAvg =
        sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;

      await prismaTx.user.update({
        where: { id: order.gig.sellerId },
        data: {
          sellerRatingAvg: sellerRatingAvg,
          sellerReviewCount: sellerReviews.length,
        },
      });

      return review;
    });

    return { success: true, review: result };
  } catch (error: any) {
    console.error("Create Review Error:", error);
    return { success: false, error: error.message };
  }
}

// Add seller reply to review
export async function addSellerReply(
  reviewId: string,
  sellerId: string,
  reply: string
) {
  try {
    if (!isValidUUID(reviewId) || !isValidUUID(sellerId)) {
      return { success: false, error: "Invalid IDs" };
    }

    // Get review to verify seller access
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        sellerId: sellerId,
      },
    });

    if (!review) {
      return { success: false, error: "Review not found or access denied" };
    }

    // Update review with seller reply
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        sellerReply: reply.trim(),
        sellerReplyAt: new Date(),
      },
    });

    return { success: true, review: updatedReview };
  } catch (error: any) {
    console.error("Add Seller Reply Error:", error);
    return { success: false, error: error.message };
  }
}

// Get reviews by gig
export async function getReviewsByGig(gigId: string, limit: number = 50) {
  try {
    if (!isValidUUID(gigId)) {
      return { success: false, error: "Invalid gig ID", reviews: [] };
    }

    const reviews = await prisma.review.findMany({
      where: { gigId: gigId },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Serialize Date fields
    const serializedReviews = reviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      sellerReplyAt: review.sellerReplyAt?.toISOString() || null,
    }));

    return { success: true, reviews: serializedReviews };
  } catch (error: any) {
    console.error("Get Reviews By Gig Error:", error);
    return { success: false, error: error.message, reviews: [] };
  }
}

// Get reviews by seller
export async function getReviewsBySeller(sellerId: string, limit: number = 50) {
  try {
    if (!isValidUUID(sellerId)) {
      return { success: false, error: "Invalid seller ID", reviews: [] };
    }

    const reviews = await prisma.review.findMany({
      where: { sellerId: sellerId },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        gig: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Serialize Date fields
    const serializedReviews = reviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      sellerReplyAt: review.sellerReplyAt?.toISOString() || null,
    }));

    return { success: true, reviews: serializedReviews };
  } catch (error: any) {
    console.error("Get Reviews By Seller Error:", error);
    return { success: false, error: error.message, reviews: [] };
  }
}

