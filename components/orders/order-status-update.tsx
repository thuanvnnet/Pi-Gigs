"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  X,
  CheckCircle2,
  Package,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { updateOrderStatus, cancelOrder } from "@/app/actions/order";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  userRole: "buyer" | "seller";
  userId: string;
  onStatusUpdate: () => void;
}

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  userRole,
  userId,
  onStatusUpdate,
}: OrderStatusUpdateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Determine available actions based on current status and user role
  const getAvailableActions = () => {
    const actions: Array<{
      status: "IN_PROGRESS" | "DELIVERED" | "COMPLETED" | "CANCELLED";
      label: string;
      icon: React.ElementType;
      variant: "default" | "outline" | "destructive";
    }> = [];

    if (userRole === "seller") {
      if (currentStatus === "PAID") {
        actions.push({
          status: "IN_PROGRESS",
          label: "Start Work",
          icon: Sparkles,
          variant: "default",
        });
      }
      if (currentStatus === "IN_PROGRESS") {
        actions.push({
          status: "DELIVERED",
          label: "Mark as Delivered",
          icon: Package,
          variant: "default",
        });
      }
    }

    if (userRole === "buyer") {
      if (currentStatus === "DELIVERED") {
        actions.push({
          status: "COMPLETED",
          label: "Complete Order",
          icon: CheckCircle2,
          variant: "default",
        });
      }
      // Buyer can cancel in certain states
      if (
        ["CREATED", "AWAITING_PAYMENT", "PAID", "IN_PROGRESS"].includes(
          currentStatus
        )
      ) {
        actions.push({
          status: "CANCELLED",
          label: "Cancel Order",
          icon: X,
          variant: "destructive",
        });
      }
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === "CANCELLED") {
      setShowCancelConfirm(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateOrderStatus(
        orderId,
        userId,
        newStatus as "IN_PROGRESS" | "DELIVERED" | "COMPLETED" | "CANCELLED"
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update order status");
      }

      onStatusUpdate();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await cancelOrder(
        orderId,
        userId,
        cancelReason.trim() || undefined
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel order");
      }

      setShowCancelConfirm(false);
      setCancelReason("");
      onStatusUpdate();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (availableActions.length === 0) {
    return null; // No actions available
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {showCancelConfirm ? (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg space-y-4">
          <div className="flex items-center gap-2 text-red-900 font-semibold">
            <AlertCircle className="h-5 w-5" />
            <span>Confirm Cancellation</span>
          </div>
          <p className="text-sm text-red-800">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason" className="text-sm text-red-900">
              Reason (Optional)
            </Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="min-h-20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="destructive"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Confirm Cancel
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setShowCancelConfirm(false);
                setCancelReason("");
                setError(null);
              }}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={action.status}
                onClick={() => handleStatusUpdate(action.status)}
                variant={action.variant}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ActionIcon className="h-4 w-4" />
                    {action.label}
                  </>
                )}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

