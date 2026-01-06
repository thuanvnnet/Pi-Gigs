"use server";

import prisma from "@/lib/prisma";

/**
 * Get all categories, optionally filtered by parentId
 * @param parentId - Optional parent category ID to get children
 * @returns Array of categories
 */
export async function getCategories(parentId?: number) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        ...(parentId !== undefined ? { parentId } : { parentId: null }), // If parentId provided, get children; otherwise get root categories
      },
      include: {
        children: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            gigs: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

/**
 * Get category by slug
 * @param slug - Category slug
 * @returns Category or null
 */
export async function getCategoryBySlug(slug: string) {
  try {
    if (!slug) {
      return null;
    }
    
    const category = await prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        parent: true,
        children: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            gigs: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });
    return category;
  } catch (error) {
    console.error("Failed to fetch category by slug:", error);
    return null;
  }
}

/**
 * Get gigs filtered by category
 * @param categoryId - Category ID
 * @param limit - Optional limit for pagination
 * @param offset - Optional offset for pagination
 * @returns Array of gigs
 */
export async function getGigsByCategory(
  categoryId: number,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const gigs = await prisma.gig.findMany({
      where: {
        categoryId,
        status: "ACTIVE",
      },
      include: {
        seller: {
          select: {
            username: true,
            avatarUrl: true,
            sellerRatingAvg: true,
          },
        },
        category: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });
    return gigs;
  } catch (error) {
    console.error("Failed to fetch gigs by category:", error);
    return [];
  }
}

/**
 * Get all categories in a flat list (for dropdowns)
 * @returns Array of all active categories
 */
export async function getAllCategoriesFlat() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, categories };
  } catch (error) {
    console.error("Failed to fetch all categories:", error);
    return { success: false, categories: [] };
  }
}
