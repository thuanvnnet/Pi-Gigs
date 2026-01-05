"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getOrder, updateRequirements } from "@/app/actions/order";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  MessageSquare,
  FileText,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrderStatusUpdate } from "@/components/orders/order-status-update";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  CREATED: {
    label: "Created",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: Clock,
  },
  AWAITING_PAYMENT: {
    label: "Awaiting Payment",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: AlertCircle,
  },
  PAID: {
    label: "Paid",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Sparkles,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: Package,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-800",
    bgColor: "bg-green-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
  DISPUTED: {
    label: "Disputed",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: AlertCircle,
  },
};

type OrderDetail = {
  id: string;
  status: string;
  amountPi: string;
  requirements: string | null;
  createdAt: string;
  updatedAt: string;
  gig: {
    id: string;
    title: string;
    slug: string;
    images: string[];
    basePricePi: string;
    seller: {
      username: string;
      avatarUrl: string | null;
      sellerRatingAvg: string;
    };
  };
  buyer: {
    username: string;
    avatarUrl: string | null;
  };
  seller: {
    username: string;
    avatarUrl: string | null;
  };
  payment: {
    status: string;
    txid: string | null;
    amount: string;
    createdAt: string;
  } | null;
  review: any | null;
};

export default function OrderDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState("");
  const [editingRequirements, setEditingRequirements] = useState(false);
  const [savingRequirements, setSavingRequirements] = useState(false);

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
        setOrder(result.order as OrderDetail);
        setRequirements(result.order.requirements || "");
      } else {
        setError(result.error || "Failed to load order");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequirements = async () => {
    if (!user?.id || !orderId) return;

    setSavingRequirements(true);
    try {
      const result = await updateRequirements(orderId, user.id, requirements);
      if (result.success) {
        setEditingRequirements(false);
        await loadOrder(); // Reload order to get latest data
      } else {
        alert(result.error || "Failed to update requirements");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setSavingRequirements(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#31BF75]" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/dashboard/orders">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-6">{error || "This order does not exist or you don't have access to it."}</p>
            <Link href="/dashboard/orders">
              <Button>Back to Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBuyer = order.buyer.username === user?.username;
  const userRole = isBuyer ? "buyer" : "seller";
  const otherParty = isBuyer ? order.seller : order.buyer;
  const statusInfo = statusConfig[order.status] || statusConfig.CREATED;
  const StatusIcon = statusInfo.icon;

  const gigImages = (order.gig.images as string[]) || [];
  const mainImage = gigImages[0] || null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/dashboard/orders">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      {/* Order Progress - Full Width on Top */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTimeline currentStatus={order.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                {/* Gig Image - Left Side */}
                {mainImage && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={mainImage}
                      alt={order.gig.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {/* Title and Info - Right Side */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge
                      className={`${statusInfo.bgColor} ${statusInfo.color} border-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {statusInfo.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <CardTitle className="text-2xl mb-2">{order.gig.title}</CardTitle>
                  <Link
                    href={`/gigs/${order.gig.id}`}
                    className="text-sm text-[#31BF75] hover:underline"
                  >
                    View Gig
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Requirements Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Requirements
                </CardTitle>
                {!editingRequirements && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRequirements(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingRequirements ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requirements">Order Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Enter order requirements..."
                      className="min-h-32 mt-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateRequirements}
                      disabled={savingRequirements}
                    >
                      {savingRequirements ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingRequirements(false);
                        setRequirements(order.requirements || "");
                      }}
                      disabled={savingRequirements}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {order.requirements || "No requirements specified."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Actions */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusUpdate
                  orderId={order.id}
                  currentStatus={order.status}
                  userRole={userRole}
                  userId={user.id}
                  onStatusUpdate={loadOrder}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </div>
                <p className="text-2xl font-bold text-[#31BF75]">
                  {Number(order.amountPi).toFixed(2)} π
                </p>
              </div>

              {order.payment && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Payment Status
                  </div>
                  <Badge
                    className={
                      order.payment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.payment.status}
                  </Badge>
                  {order.payment.txid && (
                    <p className="text-xs font-mono text-gray-600 mt-2 break-all">
                      {order.payment.txid}
                    </p>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <p className="text-sm text-gray-700">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Party Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isBuyer ? "Seller" : "Buyer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherParty.avatarUrl || ""} alt={otherParty.username} />
                  <AvatarFallback className="bg-[#31BF75] text-white">
                    {otherParty.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{otherParty.username}</p>
                  {!isBuyer && order.gig.seller.sellerRatingAvg && (
                    <p className="text-sm text-gray-600">
                      Rating: {Number(order.gig.seller.sellerRatingAvg).toFixed(1)} ⭐
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Link */}
          {order.status === "COMPLETED" && !order.review && isBuyer && (
            <Card>
              <CardContent className="pt-6">
                <Link href={`/dashboard/orders/${order.id}/review`}>
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Leave a Review
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

