"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notification";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Bell, Package, MessageCircle, Star, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    loadNotifications();
  }, [user, authLoading]);

  const loadNotifications = async (cursor?: string) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const result = await getNotifications(user.id, 20, cursor);
      if (result.success) {
        if (cursor) {
          // Append older notifications
          setNotifications((prev) => [...prev, ...(result.notifications || [])]);
        } else {
          // Replace with new notifications
          setNotifications(result.notifications || []);
        }
        setHasMore(result.hasMore || false);
        setNextCursor(result.nextCursor);
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
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }

    // Navigate based on entity type
    if (notification.entityType === "ORDER" && notification.entityId) {
      router.push(`/dashboard/orders/${notification.entityId}`);
    } else if (notification.entityType === "CONVERSATION" && notification.entityId) {
      router.push(`/messages/${notification.entityId}`);
    } else if (notification.entityType === "REVIEW" && notification.entityId) {
      router.push(`/gigs/${notification.metadata?.gigId || ""}`);
    } else if (notification.type === "FOLLOW" && notification.actorId) {
      // Navigate to follower's profile
      router.push(`/seller/${notification.actorId}`);
    }
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

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">Notifications</h1>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#31BF75] rounded-full animate-pulse"></span>
                  {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-gray-500">All caught up! ✨</span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
            >
              {markingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bell className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                You'll see notifications here when you receive messages, order updates, and more.
              </p>
            </div>
          ) : (
            <>
              <div className="py-2">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell;
                  const colorClass = notificationColors[notification.type] || "bg-gray-100 text-gray-600";
                  const notificationDate = new Date(notification.createdAt);

                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full px-4 sm:px-5 py-3.5 sm:py-4 text-left hover:bg-gray-50/80 transition-all duration-150 group",
                        !notification.isRead && "bg-gradient-to-r from-blue-50/30 via-blue-50/10 to-transparent border-l-2 border-[#31BF75]"
                      )}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Icon */}
                        <div className={cn(
                          "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105",
                          colorClass
                        )}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className={cn(
                              "text-sm font-medium text-gray-900 leading-snug",
                              !notification.isRead && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-[#31BF75] rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                            )}
                          </div>
                          {notification.content && (
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                              {notification.content}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(notificationDate, { addSuffix: true })}
                            </p>
                            {notification.actor && (
                              <>
                                <span className="text-gray-300">•</span>
                                <p className="text-xs text-gray-500">
                                  {notification.actor.username}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="px-4 py-3 border-t border-gray-100/80 text-center bg-gray-50/30">
                  <Button
                    variant="ghost"
                    onClick={() => loadNotifications(nextCursor)}
                    disabled={loading}
                    className="text-xs sm:text-sm"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-2" />
                    ) : null}
                    Load more notifications
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
