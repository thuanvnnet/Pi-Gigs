"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getOrder } from "@/app/actions/order";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { CreateReviewForm } from "@/components/reviews/create-review-form";

type OrderDetail = {
  id: string;
  status: string;
  gig: {
    id: string;
    title: string;
  };
  review: any | null;
};

export default function ReviewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (orderId) {
      loadOrder();
    }
  }, [user, authLoading, orderId]);

  const loadOrder = async () => {
    if (!user?.id || !orderId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getOrder(orderId, user.id);
      if (result.success && result.order) {
        const orderData = result.order as OrderDetail;
        setOrder(orderData);

        // Check if order is completed
        if (orderData.status !== "COMPLETED") {
          setError("You can only review completed orders");
          return;
        }

        // Check if review already exists
        if (orderData.review) {
          setError("You have already reviewed this order");
          return;
        }
      } else {
        setError(result.error || "Failed to load order");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    router.push(`/dashboard/orders/${orderId}`);
    router.refresh();
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#31BF75]" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href={`/dashboard/orders/${orderId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {error || "Order Not Found"}
            </h3>
            <p className="text-gray-500 mb-6 text-center">
              {error || "This order does not exist or you don't have access to it."}
            </p>
            <Link href={`/dashboard/orders/${orderId}`}>
              <Button>Back to Order</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href={`/dashboard/orders/${orderId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>
      </Link>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          {user && (
            <CreateReviewForm
              orderId={order.id}
              buyerId={user.id}
              gigTitle={order.gig.title}
              onSuccess={handleReviewSuccess}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

