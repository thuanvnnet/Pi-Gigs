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