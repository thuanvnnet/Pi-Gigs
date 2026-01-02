// app/actions/payment.ts
"use server";

import axios from "axios";

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

    // Update your database here (mark order as PAID)
    // await prisma.order.update(...)

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Complete Payment Error:", error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || error.message };
  }
}