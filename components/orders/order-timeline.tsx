"use client";

import { CheckCircle2, Clock, Circle, AlertCircle, Package, DollarSign, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  currentStatus: string;
}

type TimelineStep = {
  status: string;
  label: string;
  description: string;
  icon: React.ElementType;
};

const timelineSteps: TimelineStep[] = [
  {
    status: "CREATED",
    label: "Order Created",
    description: "Order has been placed",
    icon: Circle,
  },
  {
    status: "AWAITING_PAYMENT",
    label: "Awaiting Payment",
    description: "Waiting for payment",
    icon: DollarSign,
  },
  {
    status: "PAID",
    label: "Payment Received",
    description: "Payment has been completed",
    icon: CheckCircle2,
  },
  {
    status: "IN_PROGRESS",
    label: "In Progress",
    description: "Seller is working on your order",
    icon: Sparkles,
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    description: "Order has been delivered",
    icon: Package,
  },
  {
    status: "COMPLETED",
    label: "Completed",
    description: "Order has been completed",
    icon: CheckCircle2,
  },
];

// Status order for comparison
const statusOrder = [
  "CREATED",
  "AWAITING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
];

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  // Get current step index
  const currentIndex = statusOrder.indexOf(currentStatus);
  
  // Filter out cancelled/disputed from normal timeline
  const isCancelled = currentStatus === "CANCELLED";
  const isDisputed = currentStatus === "DISPUTED";
  
  // Calculate completed steps count (for progress bar)
  let completedStepsCount = 0;
  if (!isCancelled && !isDisputed && currentIndex >= 0) {
    // Find how many steps are completed
    for (let i = 0; i < timelineSteps.length; i++) {
      const stepStatusIndex = statusOrder.indexOf(timelineSteps[i].status);
      if (currentIndex > stepStatusIndex) {
        completedStepsCount++;
      } else if (currentIndex === stepStatusIndex) {
        // Current step is also counted as "reached"
        completedStepsCount++;
        break;
      }
    }
  }

  return (
    <div className="relative">
      {/* Horizontal Timeline - Compact Design */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
            {/* Progress Fill */}
            {!isCancelled && !isDisputed && completedStepsCount > 0 && timelineSteps.length > 1 && (
              <div
                className="absolute top-0 left-0 h-full bg-[#31BF75] transition-all duration-500 ease-out"
                style={{
                  width: completedStepsCount > 1
                    ? `${((completedStepsCount - 1) / (timelineSteps.length - 1)) * 100}%`
                    : '0%',
                }}
              />
            )}
          </div>

          {/* Steps Grid */}
          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {timelineSteps.map((step, index) => {
              const stepStatusIndex = statusOrder.indexOf(step.status);
              const isCompleted = currentIndex > stepStatusIndex;
              const isCurrent = currentStatus === step.status && !isCancelled && !isDisputed;

              const StepIcon = step.icon;

              return (
                <div key={step.status} className="relative flex flex-col items-center">
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-sm",
                      isCompleted
                        ? "bg-[#31BF75] border-[#31BF75] text-white"
                        : isCurrent
                        ? "bg-[#31BF75] border-[#31BF75] text-white ring-4 ring-[#31BF75]/20 shadow-lg scale-110"
                        : "bg-white border-gray-300 text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="mt-3 text-center w-full">
                    <div
                      className={cn(
                        "text-sm font-semibold mb-1 transition-colors",
                        isCompleted || isCurrent
                          ? "text-gray-900"
                          : "text-gray-500"
                      )}
                    >
                      {step.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs transition-colors line-clamp-2",
                        isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"
                      )}
                    >
                      {step.description}
                    </div>
                    {isCurrent && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-[#31BF75] bg-[#31BF75]/10 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vertical Timeline - Mobile Design */}
      <div className="md:hidden">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200">
            {/* Progress Fill */}
            {!isCancelled && !isDisputed && completedStepsCount > 0 && timelineSteps.length > 1 && (
              <div
                className="absolute top-0 left-0 w-full bg-[#31BF75] transition-all duration-500"
                style={{
                  height: completedStepsCount > 1
                    ? `${((completedStepsCount - 1) / (timelineSteps.length - 1)) * 100}%`
                    : '0%',
                }}
              />
            )}
          </div>

          {/* Steps */}
          <div className="space-y-6 relative">
            {timelineSteps.map((step, index) => {
              const stepStatusIndex = statusOrder.indexOf(step.status);
              const isCompleted = currentIndex > stepStatusIndex;
              const isCurrent = currentStatus === step.status && !isCancelled && !isDisputed;

              const StepIcon = step.icon;

              return (
                <div key={step.status} className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                      isCompleted
                        ? "bg-[#31BF75] border-[#31BF75] text-white"
                        : isCurrent
                        ? "bg-[#31BF75] border-[#31BF75] text-white ring-4 ring-[#31BF75]/20"
                        : "bg-white border-gray-300 text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5 min-w-0">
                    <div
                      className={cn(
                        "font-semibold mb-1 transition-colors",
                        isCompleted || isCurrent
                          ? "text-gray-900"
                          : "text-gray-500"
                      )}
                    >
                      {step.label}
                    </div>
                    <div
                      className={cn(
                        "text-sm transition-colors",
                        isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"
                      )}
                    >
                      {step.description}
                    </div>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-xs font-medium text-[#31BF75] leading-relaxed">
                        (Current)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cancelled/Disputed Status */}
      {(isCancelled || isDisputed) && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 bg-red-50 border-red-300 text-red-600 flex-shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-700 mb-1">
                {isCancelled ? "Order Cancelled" : "Order Disputed"}
              </div>
              <div className="text-sm text-red-600">
                {isCancelled
                  ? "This order has been cancelled"
                  : "This order is under dispute"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
