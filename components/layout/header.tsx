"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { UserNav } from "@/components/layout/user-nav";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Bell, MessageCircle, Heart } from "lucide-react";

export function Header() {
  const { user, isLoading, login } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Placeholder for unread counts - will be replaced with actual API calls later
  const unreadMessages = 0; // TODO: Fetch from API
  const unreadNotifications = 0; // TODO: Fetch from API

  const handleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      await login();
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  // Show loading spinner while initial auth check
  if (isLoading && !user) {
    return (
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="flex h-12 md:h-16 items-center px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 transition-opacity hover:opacity-80">
            <img src="/logo.svg" alt="Logo" className="h-7 sm:h-8 md:h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-gray-400" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm transition-shadow duration-300">
      <div className="flex h-12 md:h-16 items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 transition-opacity hover:opacity-80 active:opacity-70"
          aria-label="Home"
        >
          <img src="/logo.svg" alt="Logo" className="h-7 sm:h-8 md:h-9 w-auto object-contain" />
        </Link>

        {/* Search Bar - Hidden on mobile, visible on tablet+ */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 mx-4"
          role="search"
          aria-label="Search for gigs"
        >
          <div className="flex items-center gap-0 w-full">
            <div
              className={`flex-1 flex items-center gap-2 bg-gray-50 border-y border-l rounded-l-lg pl-3 pr-2 h-9 transition-all duration-200 ${
                isSearchFocused
                  ? "border-[#31BF75] bg-white shadow-md shadow-[#31BF75]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="search"
                placeholder="What service are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
                aria-label="Search input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchFocused(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              className={`h-9 px-3 border-y border-r rounded-r-lg transition-all duration-200 ${
                isSearchFocused
                  ? "bg-[#31BF75] text-white hover:bg-[#27995E] border-[#31BF75]"
                  : "bg-gray-200 text-gray-600 hover:bg-[#31BF75] hover:text-white border-gray-200 hover:border-[#31BF75]"
              }`}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Action Icons - Only show when logged in */}
          {user && (
            <>
              {/* Favorites Button - Hidden on very small screens */}
              <Link
                href="/dashboard/favorites"
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 group"
                aria-label="Favorite gigs"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-[#31BF75] transition-colors duration-200" />
              </Link>

              {/* Messages Button */}
              <Link
                href="/dashboard/messages"
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 group"
                aria-label={`Messages${unreadMessages > 0 ? `, ${unreadMessages} unread` : ""}`}
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-[#31BF75] transition-colors duration-200" />
                {/* Badge for unread messages */}
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] bg-[#31BF75] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-1 sm:px-1.5 animate-pulse" aria-label={`${unreadMessages} unread messages`}>
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Notifications Button */}
              <Link
                href="/dashboard/notifications"
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 group"
                aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ""}`}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 group-hover:text-[#31BF75] transition-colors duration-200" />
                {/* Badge for unread notifications */}
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-1 sm:px-1.5 animate-pulse" aria-label={`${unreadNotifications} unread notifications`}>
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Mobile Search Icon */}
          <Link
            href="/"
            className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </Link>

          {/* Sign In / User Nav */}
          {user ? (
            <UserNav />
          ) : (
            <Button
              variant="ghost"
              onClick={handleSignIn}
              disabled={isSigningIn}
              aria-label="Sign in with Pi Network"
              className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 md:px-4 text-sm sm:text-base font-medium text-gray-700 hover:text-[#31BF75] hover:bg-gray-50 transition-all duration-200"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  <span className="hidden sm:inline">Signing in...</span>
                </>
              ) : (
                <>
                  <span className="text-xs sm:text-sm md:text-base">Sign In</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}