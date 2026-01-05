// app/actions/order.ts
"use server";

import prisma from "@/lib/prisma";

// Validate UUID bằng regex
const isValidUUID = (id: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

export async function createOrder(gigId: string, buyerId: string) {
  try {
    // 1. Validate UUID cứng
    if (!isValidUUID(buyerId) || buyerId === "unknown") {
      throw new Error("Invalid Buyer ID. Please login again.");
    }

    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
    });

    if (!gig) throw new Error("Gig not found");
    
    // Tạm thời comment dòng này để bạn test tự mua hàng của mình
    // if (gig.sellerId === buyerId) throw new Error("You cannot buy your own gig");

    const order = await prisma.order.create({
      data: {
        gigId: gig.id,
        buyerId: buyerId,
        sellerId: gig.sellerId,
        amountPi: gig.basePricePi,
        status: "CREATED", 
        requirements: "Waiting for requirements...",
      },
    });

    return { success: true, orderId: order.id, amount: Number(gig.basePricePi) };
  } catch (error: any) {
    console.error("Create Order Server Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getOrders(userId: string) {
  try {
    if (!isValidUUID(userId)) {
      return { success: false, error: "Invalid user ID", orders: [] };
    }

    // Get orders where user is either buyer or seller
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            seller: {
              select: {
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        buyer: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        payment: {
          select: {
            status: true,
            txid: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Serialize Decimal and Date fields
    const serializedOrders = orders.map((order) => ({
      ...order,
      amountPi: order.amountPi.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      payment: order.payment
        ? {
            ...order.payment,
            createdAt: order.payment.createdAt.toISOString(),
          }
        : null,
    }));

    return { success: true, orders: serializedOrders };
  } catch (error: any) {
    console.error("Get Orders Error:", error);
    return { success: false, error: error.message, orders: [] };
  }
}

export async function getOrder(orderId: string, userId: string) {
  try {
    if (!isValidUUID(orderId) || !isValidUUID(userId)) {
      return { success: false, error: "Invalid IDs" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        gig: {
          include: {
            seller: {
              select: {
                username: true,
                avatarUrl: true,
                sellerRatingAvg: true,
              },
            },
          },
        },
        buyer: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        payment: true,
        review: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found or access denied" };
    }

    // Serialize Decimal and Date fields
    const serializedOrder = {
      ...order,
      amountPi: order.amountPi.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      gig: {
        ...order.gig,
        basePricePi: order.gig.basePricePi.toString(),
        ratingAvg: order.gig.ratingAvg.toString(),
        createdAt: order.gig.createdAt.toISOString(),
        updatedAt: order.gig.updatedAt.toISOString(),
        seller: {
          ...order.gig.seller,
          sellerRatingAvg: order.gig.seller.sellerRatingAvg.toString(),
        },
      },
      payment: order.payment
        ? {
            ...order.payment,
            amount: order.payment.amount.toString(),
            createdAt: order.payment.createdAt.toISOString(),
            updatedAt: order.payment.updatedAt.toISOString(),
          }
        : null,
    };

    return { success: true, order: serializedOrder };
  } catch (error: any) {
    console.error("Get Order Error:", error);
    return { success: false, error: error.message };
  }
}

// Update order status (with validation for role-based actions)
export async function updateOrderStatus(
  orderId: string,
  userId: string,
  newStatus: "IN_PROGRESS" | "DELIVERED" | "COMPLETED" | "CANCELLED"
) {
  try {
    if (!isValidUUID(orderId) || !isValidUUID(userId)) {
      return { success: false, error: "Invalid IDs" };
    }

    // Get order with buyer and seller info
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        status: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found or access denied" };
    }

    const isSeller = order.sellerId === userId;
    const isBuyer = order.buyerId === userId;

    // Validate status transitions based on role
    if (newStatus === "IN_PROGRESS" && !isSeller) {
      return { success: false, error: "Only seller can mark order as IN_PROGRESS" };
    }
    if (newStatus === "DELIVERED" && !isSeller) {
      return { success: false, error: "Only seller can mark order as DELIVERED" };
    }
    if (newStatus === "COMPLETED" && !isBuyer) {
      return { success: false, error: "Only buyer can mark order as COMPLETED" };
    }
    if (newStatus === "CANCELLED" && !isBuyer) {
      return { success: false, error: "Only buyer can cancel order" };
    }

    // Validate status transitions (state machine)
    const validTransitions: Record<string, string[]> = {
      CREATED: ["CANCELLED"],
      AWAITING_PAYMENT: ["CANCELLED"],
      PAID: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["DELIVERED"],
      DELIVERED: ["COMPLETED"],
      COMPLETED: [], // Final state
      CANCELLED: [], // Final state
      DISPUTED: [],
    };

    const allowedStatuses = validTransitions[order.status] || [];
    if (!allowedStatuses.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot change status from ${order.status} to ${newStatus}`,
      };
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Order Status Error:", error);
    return { success: false, error: error.message };
  }
}

// Update order requirements
export async function updateRequirements(
  orderId: string,
  userId: string,
  requirements: string
) {
  try {
    if (!isValidUUID(orderId) || !isValidUUID(userId)) {
      return { success: false, error: "Invalid IDs" };
    }

    // Get order to check access
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      select: {
        id: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found or access denied" };
    }

    // Both buyer and seller can update requirements for flexibility
    // Update requirements
    await prisma.order.update({
      where: { id: orderId },
      data: { requirements: requirements.trim() },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Requirements Error:", error);
    return { success: false, error: error.message };
  }
}

// Cancel order (buyer only)
export async function cancelOrder(orderId: string, userId: string, reason?: string) {
  try {
    if (!isValidUUID(orderId) || !isValidUUID(userId)) {
      return { success: false, error: "Invalid IDs" };
    }

    // Get order to check access
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: userId, // Only buyer can cancel
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found or access denied" };
    }

    // Only allow cancellation if order hasn't been completed
    const finalStates = ["COMPLETED", "CANCELLED", "DISPUTED"];
    if (finalStates.includes(order.status)) {
      return { success: false, error: `Cannot cancel order with status ${order.status}` };
    }

    // Update order status to CANCELLED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Cancel Order Error:", error);
    return { success: false, error: error.message };
  }
}