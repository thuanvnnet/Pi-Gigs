// components/checkout/checkout-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { createOrder } from "@/app/actions/order";
import { approvePayment, completePayment } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

interface CheckoutButtonProps {
  gigId: string;
  price: number;
}

export function CheckoutButton({ gigId, price }: CheckoutButtonProps) {
  const { user, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handlePayment = async () => {
    if (!user || !user.id) {
      alert("Please login first.");
      login();
      return;
    }

    setLoading(true);
    setStatus("Initializing...");

    try {
      // 1. Authenticate
      if (window.Pi) {
          try {
             await window.Pi.authenticate(["username", "payments"], {
                // FIX: Thêm ": any" vào (p) để TypeScript không báo lỗi
                onIncompletePaymentFound: (p: any) => console.log("Incomplete:", p)
             });
          } catch (e) { console.warn(e); }
      }

      // 2. Create Order
      setStatus("Creating Order...");
      const orderRes = await createOrder(gigId, user.id);
      
      // Kiểm tra kỹ cả amount để TS không báo lỗi 'possibly undefined'
      if (!orderRes.success || !orderRes.orderId || !orderRes.amount) {
        throw new Error(orderRes.error || "Order creation failed");
      }
      
      const orderId = orderRes.orderId;

      // 3. Prepare Data
      const paymentData = {
        amount: parseFloat(orderRes.amount.toString()),
        memo: `Order #${orderRes.orderId.slice(0, 8)}`,
        metadata: { orderId: orderRes.orderId, type: "gig_purchase" },
      };

      // 4. Define Callbacks
      const callbacks = {
        onReadyForServerApproval: (paymentId: string) => {
            setStatus("Verifying...");
            approvePayment(paymentId, orderRes.orderId)
                .then(res => {
                    if(!res.success) alert("Approve Failed: " + res.error);
                })
                .catch(e => alert("Approve Error: " + e.message));
        },
        onServerCompleted: (paymentId: string, txid: string) => {
            setStatus("Finalizing...");
            completePayment(paymentId, txid, orderRes.orderId)
                .then(res => {
                    if (res.success) {
                        setStatus("Success!");
                        alert("Payment Successful!");
                        router.push("/dashboard/orders");
                    } else {
                        alert("Complete Failed: " + res.error);
                    }
                })
                .catch(e => alert("Complete Error: " + e.message));
        },
        onCancel: (paymentId: string) => {
            setLoading(false);
            setStatus("");
        },
        onError: (error: Error, payment?: any) => {
            setLoading(false);
            setStatus("");
            if (error.message) alert("Error: " + error.message);
        }
      };

      // 5. Create Payment
      setStatus("Waiting for Pi...");
      if (!window.Pi) throw new Error("Pi SDK not loaded");
      
      await window.Pi.createPayment(paymentData, callbacks);

    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message);
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="w-full">
      {status && (
        <p className="text-center text-sm text-[#660099] font-medium mb-2 animate-pulse">
          {status}
        </p>
      )}
      <Button 
        onClick={handlePayment} 
        disabled={loading} 
        className="w-full bg-[#660099] hover:bg-[#52007a] py-6 text-lg font-bold"
      >
        {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
        ) : (
            <><ShieldCheck className="mr-2 h-5 w-5" /> Pay {price} Pi</>
        )}
      </Button>
    </div>
  );
}