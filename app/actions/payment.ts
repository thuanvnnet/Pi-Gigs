// app/actions/payment.ts
"use server";

import axios from "axios";
import prisma from "@/lib/prisma";
import { createNotification } from "@/app/actions/notification";

const PI_API_URL = "https://api.minepi.com/v2";

export async function approvePayment(paymentId: string, orderId: string) {
  try {
    console.log(`Approving payment ${paymentId} for order ${orderId}`);
    
    // Call Pi API to approve
    const response = await axios.post(
      `${PI_API_URL}/payments/${paymentId}/approve`,
      {},
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
        },
      }
    );

    // Update database: Create or update PiPayment with AUTHORIZED status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { amountPi: true },
    });

    if (order) {
      await prisma.piPayment.upsert({
        where: { orderId: orderId },
        update: {
          piPaymentId: paymentId,
          status: "AUTHORIZED",
        },
        create: {
          orderId: orderId,
          piPaymentId: paymentId,
          amount: order.amountPi,
          status: "AUTHORIZED",
        },
      });

      // Update order status to AWAITING_PAYMENT (optional, or keep CREATED)
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "AWAITING_PAYMENT" },
      });
    }

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Approve Payment Error:", error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || error.message };
  }
}

export async function completePayment(paymentId: string, txid: string, orderId: string) {
  try {
    console.log(`Completing payment ${paymentId} with txid ${txid}`);

    // Call Pi API to complete
    const response = await axios.post(
      `${PI_API_URL}/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
        },
      }
    );

    // Update database: Mark order as PAID and update PiPayment
    const orderData = await prisma.$transaction(async (prismaTx) => {
      // Get order with buyer and seller info
      const order = await prismaTx.order.findUnique({
        where: { id: orderId },
        include: {
          gig: {
            select: {
              title: true,
            },
          },
          buyer: {
            select: {
              id: true,
              username: true,
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Update PiPayment with txid and COMPLETED status
      await prismaTx.piPayment.upsert({
        where: { orderId: orderId },
        update: {
          piPaymentId: paymentId,
          txid: txid,
          status: "COMPLETED",
        },
        create: {
          orderId: orderId,
          piPaymentId: paymentId,
          txid: txid,
          amount: order.amountPi,
          status: "COMPLETED",
        },
      });

      // Update order status to PAID
      await prismaTx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      return order;
    });

    // Notify both buyer and seller about payment completion
    const amount = Number(orderData.amountPi).toFixed(2);
    
    await createNotification(
      orderData.buyerId,
      "PAYMENT",
      "Payment Completed",
      `Payment of ${amount} π has been completed for "${orderData.gig.title}"`,
      orderData.sellerId,
      orderId,
      "ORDER",
      { gigId: orderData.gig.id, gigTitle: orderData.gig.title, amount }
    );

    await createNotification(
      orderData.sellerId,
      "PAYMENT",
      "Payment Received",
      `You received ${amount} π payment for "${orderData.gig.title}"`,
      orderData.buyerId,
      orderId,
      "ORDER",
      { gigId: orderData.gig.id, gigTitle: orderData.gig.title, amount }
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Complete Payment Error:", error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || error.message };
  }
}