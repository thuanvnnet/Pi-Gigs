"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notification";
import { useAuth } from "@/components/providers/auth-provider";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Package, MessageCircle, Star, CreditCard, Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  onClose: () => void;
}

const notificationIcons: Record<string, React.ElementType> = {
  ORDER_CREATED: Package,
  ORDER_UPDATED: Package,
  ORDER_COMPLETED: Package,
  MESSAGE: MessageCircle,
  REVIEW: Star,
  PAYMENT: CreditCard,
  FOLLOW: Bell,
};

const notificationColors: Record<string, string> = {
  ORDER_CREATED: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600",
  ORDER_UPDATED: "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-600",
  ORDER_COMPLETED: "bg-gradient-to-br from-green-50 to-green-100 text-green-600",
  MESSAGE: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600",
  REVIEW: "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600",
  PAYMENT: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600",
  FOLLOW: "bg-gradient-to-br from-pink-50 to-pink-100 text-pink-600",
};

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const result = await getNotifications(user.id, 10);
      if (result.success) {
        setNotifications(result.notifications || []);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead && user?.id) {
      await markAsRead(notification.id, user.id);
    }

      // Navigate based on entity type
      if (notification.entityType === "ORDER" && notification.entityId) {
        router.push(`/dashboard/orders/${notification.entityId}`);
      } else if (notification.entityType === "CONVERSATION" && notification.entityId) {
        router.push(`/messages/${notification.entityId}`);
      } else if (notification.entityType === "REVIEW" && notification.entityId) {
        // Navigate to gig or order review
        router.push(`/gigs/${notification.metadata?.gigId || ""}`);
      } else if (notification.type === "FOLLOW" && notification.actorId) {
        // Navigate to follower's profile
        router.push(`/seller/${notification.actorId}`);
      }

    onClose();
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    setMarkingAll(true);
    try {
      const result = await markAllAsRead(user.id);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="w-80 sm:w-96 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={dropdownRef} 
      className="w-80 sm:w-96 bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100/80 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Marking...
                  </span>
                ) : (
                  "Mark all read"
                )}
              </button>
            )}
            <Link
              href="/dashboard/notifications"
              onClick={onClose}
              className="text-xs text-[#31BF75] hover:text-[#27995E] font-medium transition-colors"
            >
              View all
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-3">
              <Bell className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((notification, index) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || "bg-gray-100 text-gray-600";
              const notificationDate = new Date(notification.createdAt);

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-left hover:bg-gray-50/80 transition-all duration-150 group",
                    !notification.isRead && "bg-gradient-to-r from-blue-50/40 to-transparent border-l-2 border-[#31BF75]"
                  )}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105",
                      colorClass
                    )}>
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={cn(
                          "text-xs sm:text-sm font-medium text-gray-900 leading-snug",
                          !notification.isRead && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-1.5 h-1.5 bg-[#31BF75] rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                      {notification.content && (
                        <p className="text-[11px] sm:text-xs text-gray-600 line-clamp-2 mb-1 leading-relaxed">
                          {notification.content}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400">
                        {formatDistanceToNow(notificationDate, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
