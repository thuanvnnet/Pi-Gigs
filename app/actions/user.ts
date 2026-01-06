"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Validate UUID
const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: {
    bio?: string;
    avatarUrl?: string;
    phone?: string;
    location?: string;
    website?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    facebookUrl?: string;
    skills?: string[];
    languages?: string[];
    timezone?: string;
  }
) {
  if (!isValidUUID(userId)) {
    return { success: false, error: "Invalid user ID format" };
  }

  try {
    // Validate bio length if provided
    if (data.bio !== undefined && data.bio.length > 500) {
      return { success: false, error: "Bio must be less than 500 characters" };
    }

    // Validate URLs if provided (only validate if not empty)
    const urlFields = ['website', 'twitterUrl', 'linkedinUrl', 'facebookUrl'];
    for (const field of urlFields) {
      const value = data[field as keyof typeof data];
      if (value && typeof value === 'string' && value.trim() && value.trim() !== '') {
        try {
          // Allow URLs without protocol, will add https:// if needed
          let urlToValidate = value.trim();
          if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
            urlToValidate = `https://${urlToValidate}`;
          }
          new URL(urlToValidate);
        } catch {
          return { success: false, error: `Invalid ${field} URL format` };
        }
      }
    }

    // Validate phone format if provided (more lenient)
    if (data.phone && data.phone.trim() && data.phone.trim() !== '') {
      // More lenient phone validation - just check it has some digits
      const phoneRegex = /^[\+]?[(]?[0-9\s\-\(\)\.]{7,}$/;
      if (!phoneRegex.test(data.phone.trim())) {
        return { success: false, error: "Invalid phone number format" };
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(data.bio !== undefined && { bio: data.bio?.trim() || null }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
        ...(data.location !== undefined && { location: data.location?.trim() || null }),
        ...(data.website !== undefined && { website: data.website?.trim() || null }),
        ...(data.twitterUrl !== undefined && { twitterUrl: data.twitterUrl?.trim() || null }),
        ...(data.linkedinUrl !== undefined && { linkedinUrl: data.linkedinUrl?.trim() || null }),
        ...(data.facebookUrl !== undefined && { facebookUrl: data.facebookUrl?.trim() || null }),
        ...(data.skills !== undefined && { skills: data.skills || [] }),
        ...(data.languages !== undefined && { languages: data.languages || [] }),
        ...(data.timezone !== undefined && { timezone: data.timezone?.trim() || null }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        twitterUrl: true,
        linkedinUrl: true,
        facebookUrl: true,
        skills: true,
        languages: true,
        timezone: true,
        walletBalance: true,
        sellerRatingAvg: true,
        sellerReviewCount: true,
        createdAt: true,
      },
    });

    // Revalidate profile pages
    revalidatePath("/dashboard/profile");
    revalidatePath(`/seller/${userId}`);

    return {
      success: true,
      user: {
        ...updatedUser,
        walletBalance: updatedUser.walletBalance.toString(),
        sellerRatingAvg: updatedUser.sellerRatingAvg.toString(),
      },
    };
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return { 
      success: false, 
      error: error?.message || "Failed to update profile. Please try again." 
    };
  }
}

/**
 * Get seller profile with statistics
 */
export async function getSellerProfile(sellerId: string) {
  if (!isValidUUID(sellerId)) {
    return { success: false, error: "Invalid seller ID format" };
  }

  try {
    const seller = await prisma.user.findUnique({
      where: {
        id: sellerId,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        twitterUrl: true,
        linkedinUrl: true,
        facebookUrl: true,
        skills: true,
        languages: true,
        timezone: true,
        sellerRatingAvg: true,
        sellerReviewCount: true,
        createdAt: true,
        _count: {
          select: {
            gigs: {
              where: {
                status: "ACTIVE",
              },
            },
            sellingOrders: {
              where: {
                status: "COMPLETED",
              },
            },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!seller) {
      return { success: false, error: "Seller not found" };
    }

    return {
      success: true,
      seller: {
        ...seller,
        sellerRatingAvg: seller.sellerRatingAvg.toString(),
        walletBalance: "0", // Don't expose wallet balance on public profile
        activeGigsCount: seller._count.gigs,
        completedOrdersCount: seller._count.sellingOrders,
        followersCount: seller._count.followers,
        followingCount: seller._count.following,
      },
    };
  } catch (error) {
    console.error("Get Seller Profile Error:", error);
    return { success: false, error: "Failed to fetch seller profile" };
  }
}

/**
 * Get seller's gigs
 */
export async function getSellerGigs(
  sellerId: string,
  limit: number = 20,
  offset: number = 0
) {
  if (!isValidUUID(sellerId)) {
    return { success: false, error: "Invalid seller ID format", gigs: [] };
  }

  try {
    const gigs = await prisma.gig.findMany({
      where: {
        sellerId,
        status: "ACTIVE",
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            orders: {
              where: {
                status: "COMPLETED",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      gigs,
    };
  } catch (error) {
    console.error("Get Seller Gigs Error:", error);
    return { success: false, error: "Failed to fetch seller gigs", gigs: [] };
  }
}

/**
 * Get seller's reviews
 */
export async function getSellerReviews(
  sellerId: string,
  limit: number = 10
) {
  if (!isValidUUID(sellerId)) {
    return { success: false, error: "Invalid seller ID format", reviews: [] };
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        sellerId,
      },
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Serialize Date fields
    const serializedReviews = reviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      sellerReplyAt: review.sellerReplyAt?.toISOString() || null,
    }));

    return {
      success: true,
      reviews: serializedReviews,
    };
  } catch (error) {
    console.error("Get Seller Reviews Error:", error);
    return { success: false, error: "Failed to fetch seller reviews", reviews: [] };
  }
}
