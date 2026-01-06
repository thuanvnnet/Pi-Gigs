"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getUnreadCount } from "@/app/actions/message";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Custom hook to fetch and poll unread message count
 * Updates every 10 seconds when user is logged in
 * Also refetches when window gains focus or pathname changes
 */
export function useUnreadMessages() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const result = await getUnreadCount(user.id);
      if (result.success) {
        setUnreadCount(result.count || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Set up polling every 10 seconds
    if (user?.id) {
      intervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 10000); // Poll every 10 seconds
    }

    // Cleanup interval on unmount or when user changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id, fetchUnreadCount]);

  // Refetch when pathname changes (user navigates to/from messages page)
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
    }
  }, [pathname, user?.id, fetchUnreadCount]);

  // Refetch when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        fetchUnreadCount();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user?.id, fetchUnreadCount]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
}
