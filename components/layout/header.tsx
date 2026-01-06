"use client";

import React, { useState, FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { UserNav } from "@/components/layout/user-nav";
import { useAuth } from "@/components/providers/auth-provider";
import { useUnreadMessages } from "@/components/hooks/use-unread-messages";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, MessageCircle, Heart, X, TrendingUp, Package } from "lucide-react";
import { getSearchSuggestions } from "@/app/actions/search";
import { useDebounce } from "@/hooks/use-debounce";

export function Header() {
  const { user, isLoading, login } = useAuth();
  const { unreadCount: unreadMessages } = useUnreadMessages();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<{ keywords: string[]; gigs: any[] }>({ keywords: [], gigs: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const debouncedQuery = useDebounce(searchQuery, 300);

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

  // Load suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      loadSuggestions(debouncedQuery);
    } else {
      setSuggestions({ keywords: [], gigs: [] });
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSuggestions = async (query: string) => {
    setLoadingSuggestions(true);
    try {
      const result = await getSearchSuggestions(query, 5);
      if (result.success) {
        setSuggestions({
          keywords: result.keywords || [],
          gigs: result.gigs || [],
        });
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setShowSuggestions(false);
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
          className="hidden md:flex flex-1 mx-4 relative"
          role="search"
          aria-label="Search for gigs"
        >
          <div className="flex items-center gap-0 w-full">
            <div
              className={`flex-1 flex items-center gap-2 bg-gray-50 border-y border-l rounded-l-lg pl-3 pr-2 h-9 transition-all duration-200 relative ${
                isSearchFocused
                  ? "border-[#31BF75] bg-white shadow-md shadow-[#31BF75]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                ref={searchInputRef}
                type="search"
                placeholder="What service are you looking for?"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchQuery.trim().length >= 2 && (suggestions.keywords.length > 0 || suggestions.gigs.length > 0)) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestions
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit(e as any);
                    setShowSuggestions(false);
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden"
                style={{
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
                aria-label="Search input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchFocused(false);
                    setShowSuggestions(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-sm z-10"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && (suggestions.keywords.length > 0 || suggestions.gigs.length > 0) && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2"
                >
                  {/* Keywords Section */}
                  {suggestions.keywords.length > 0 && (
                    <div className="p-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Keywords</span>
                      </div>
                      <div className="space-y-0.5">
                        {suggestions.keywords.map((keyword, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSearchQuery(keyword);
                              router.push(`/search?q=${encodeURIComponent(keyword)}`);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#31BF75] rounded-md transition-colors"
                          >
                            <Search className="h-3.5 w-3.5 inline-block mr-2 text-gray-400" />
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gigs Section */}
                  {suggestions.gigs.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <Package className="h-3.5 w-3.5" />
                        <span>Gigs</span>
                      </div>
                      <div className="space-y-1">
                        {suggestions.gigs.map((gig) => (
                          <Link
                            key={gig.id}
                            href={`/gigs/${gig.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-md transition-colors group"
                          >
                            {gig.images && Array.isArray(gig.images) && gig.images.length > 0 ? (
                              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                                <img
                                  src={gig.images[0]}
                                  alt={gig.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-[#31BF75] transition-colors truncate">
                                {gig.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {gig.seller && (
                                  <div className="flex items-center gap-1.5">
                                    <Avatar className="h-4 w-4 border border-gray-200">
                                      <AvatarImage src={gig.seller.avatarUrl || ""} alt={gig.seller.username} />
                                      <AvatarFallback className="text-[8px] bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white">
                                        {gig.seller.username[0].toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-gray-500">{gig.seller.username}</span>
                                  </div>
                                )}
                                {gig.category && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-500">{gig.category.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="text-sm font-bold text-[#31BF75]">
                                {Number(gig.basePricePi).toFixed(2)} π
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {loadingSuggestions && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Loading suggestions...
                    </div>
                  )}
                </div>
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
                href="/messages"
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
              <NotificationBell />
            </>
          )}

          {/* Mobile Search Icon */}
          <Link
            href="/search"
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