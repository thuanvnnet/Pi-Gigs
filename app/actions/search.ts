"use server";

import prisma from "@/lib/prisma";

export type SortOption = "price_asc" | "price_desc" | "rating_desc" | "date_desc" | "date_asc";

export interface SearchFilters {
  query?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  deliveryDays?: number;
  sortBy?: SortOption;
}

export interface SearchResult {
  success: boolean;
  gigs?: any[];
  total?: number;
  error?: string;
}

/**
 * Search gigs with filters and sorting
 */
export async function searchGigs(
  filters: SearchFilters,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult> {
  try {
    const where: any = {
      status: "ACTIVE",
    };

    // Search by query (title or description)
    if (filters.query && filters.query.trim()) {
      where.OR = [
        {
          title: {
            contains: filters.query.trim(),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: filters.query.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    // Filter by category
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      where.basePricePi = {
        ...where.basePricePi,
        gte: filters.minPrice,
      };
    }
    if (filters.maxPrice !== undefined) {
      where.basePricePi = {
        ...where.basePricePi,
        lte: filters.maxPrice,
      };
    }

    // Filter by minimum rating
    if (filters.minRating !== undefined) {
      where.ratingAvg = {
        gte: filters.minRating,
      };
    }

    // Filter by delivery days
    if (filters.deliveryDays !== undefined) {
      where.deliveryDays = {
        lte: filters.deliveryDays,
      };
    }

    // Build orderBy based on sort option
    let orderBy: any = { createdAt: "desc" }; // Default
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price_asc":
          orderBy = { basePricePi: "asc" };
          break;
        case "price_desc":
          orderBy = { basePricePi: "desc" };
          break;
        case "rating_desc":
          orderBy = { ratingAvg: "desc" };
          break;
        case "date_desc":
          orderBy = { createdAt: "desc" };
          break;
        case "date_asc":
          orderBy = { createdAt: "asc" };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }
    }

    // Get total count for pagination
    const total = await prisma.gig.count({ where });

    // Fetch gigs
    const gigs = await prisma.gig.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            sellerRatingAvg: true,
          },
        },
        category: {
          select: {
            id: true,
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
      orderBy,
      take: limit,
      skip: offset,
    });

    // Serialize Decimal fields - convert all Decimal to string
    const serializedGigs = gigs.map((gig) => {
      const serialized: any = {
        id: gig.id,
        title: gig.title,
        slug: gig.slug,
        description: gig.description,
        basePricePi: gig.basePricePi.toString(),
        ratingAvg: gig.ratingAvg.toString(),
        ratingCount: gig.ratingCount,
        deliveryDays: gig.deliveryDays,
        images: gig.images,
        attributes: gig.attributes,
        status: gig.status,
        createdAt: gig.createdAt.toISOString(),
        updatedAt: gig.updatedAt.toISOString(),
        completedSalesCount: gig._count.orders,
        seller: gig.seller
          ? {
              id: gig.seller.id,
              username: gig.seller.username,
              avatarUrl: gig.seller.avatarUrl,
              sellerRatingAvg: gig.seller.sellerRatingAvg.toString(),
            }
          : null,
        category: gig.category
          ? {
              id: gig.category.id,
              name: gig.category.name,
              slug: gig.category.slug,
            }
          : null,
      };
      return serialized;
    });

    return {
      success: true,
      gigs: serializedGigs,
      total,
    };
  } catch (error: any) {
    console.error("Search Gigs Error:", error);
    return {
      success: false,
      error: error?.message || "Failed to search gigs",
      gigs: [],
      total: 0,
    };
  }
}

/**
 * Get price range for filter
 */
export async function getPriceRange() {
  try {
    const result = await prisma.gig.aggregate({
      where: {
        status: "ACTIVE",
      },
      _min: {
        basePricePi: true,
      },
      _max: {
        basePricePi: true,
      },
    });

    return {
      success: true,
      minPrice: result._min.basePricePi ? Number(result._min.basePricePi) : 0,
      maxPrice: result._max.basePricePi ? Number(result._max.basePricePi) : 1000,
    };
  } catch (error: any) {
    console.error("Get Price Range Error:", error);
    return {
      success: false,
      minPrice: 0,
      maxPrice: 1000,
    };
  }
}

/**
 * Get search suggestions (keywords and gigs)
 */
export async function getSearchSuggestions(query: string, limit: number = 5) {
  if (!query || query.trim().length < 2) {
    return {
      success: true,
      keywords: [],
      gigs: [],
    };
  }

  try {
    const searchTerm = query.trim();

    // Get keyword suggestions from gig titles
    const keywordGigs = await prisma.gig.findMany({
      where: {
        status: "ACTIVE",
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        title: true,
      },
      take: 10,
      orderBy: {
        ratingAvg: "desc",
      },
    });

    // Extract unique keywords from titles
    const keywords = Array.from(
      new Set(
        keywordGigs
          .map((gig) => {
            // Extract words that contain the search term
            const words = gig.title.toLowerCase().split(/\s+/);
            return words.filter((word) => word.includes(searchTerm.toLowerCase()));
          })
          .flat()
          .filter((word) => word.length >= 2)
      )
    ).slice(0, limit);

    // Get gig suggestions
    const gigs = await prisma.gig.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        seller: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
      orderBy: {
        ratingAvg: "desc",
      },
    });

    // Serialize Decimal fields - convert all Decimal to string
    const serializedGigs = gigs.map((gig) => {
      const serialized: any = {
        id: gig.id,
        title: gig.title,
        slug: gig.slug,
        description: gig.description,
        basePricePi: gig.basePricePi.toString(),
        ratingAvg: gig.ratingAvg.toString(),
        ratingCount: gig.ratingCount,
        deliveryDays: gig.deliveryDays,
        images: gig.images,
        status: gig.status,
        createdAt: gig.createdAt.toISOString(),
        updatedAt: gig.updatedAt.toISOString(),
        seller: gig.seller
          ? {
              username: gig.seller.username,
              avatarUrl: gig.seller.avatarUrl,
            }
          : null,
        category: gig.category
          ? {
              name: gig.category.name,
            }
          : null,
      };
      return serialized;
    });

    return {
      success: true,
      keywords,
      gigs: serializedGigs,
    };
  } catch (error: any) {
    console.error("Get Search Suggestions Error:", error);
    return {
      success: false,
      keywords: [],
      gigs: [],
    };
  }
}
