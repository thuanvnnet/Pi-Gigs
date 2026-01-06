"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadNotifications } from "@/components/hooks/use-unread-notifications";
import { NotificationDropdown } from "./notification-dropdown";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useUnreadNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 group",
          className
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-[#31BF75] transition-colors duration-200" />
        {/* Badge for unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-1 sm:px-1.5 animate-pulse" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}>
          <div className="absolute right-4 sm:right-6 top-16 sm:top-20 z-50" onClick={(e) => e.stopPropagation()}>
            <NotificationDropdown onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
