// components/home/search-bar.tsx
"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSearchSuggestions } from "@/app/actions/search";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ keywords: string[]; gigs: any[] }>({ keywords: [], gigs: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300);

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

  const loadSuggestions = async (searchQuery: string) => {
    setLoadingSuggestions(true);
    try {
      const result = await getSearchSuggestions(searchQuery, 5);
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto mb-8 relative"
      role="search"
      aria-label="Search for gigs"
    >
      <div className={`flex items-center gap-0 bg-white border rounded-2xl shadow-lg transition-all duration-300 relative overflow-hidden ${
        isFocused || showSuggestions
          ? "border-green-500 shadow-green-500/20 shadow-xl"
          : "border-gray-200 hover:border-green-400/60 hover:shadow-xl"
      }`}>
        <label htmlFor="search-input" className="sr-only">
          Search for gigs
        </label>

        {/* Input Container */}
        <div className="flex-1 relative min-w-0">
          <input
            ref={searchInputRef}
            id="search-input"
            type="search"
            placeholder="What are you looking for today?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim().length >= 2) {
                setShowSuggestions(true);
              } else {
                setShowSuggestions(false);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              if (query.trim().length >= 2 && (suggestions.keywords.length > 0 || suggestions.gigs.length > 0)) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e as any);
                setShowSuggestions(false);
              } else if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            className="w-full py-4 pl-5 pr-10 text-base text-gray-900 placeholder:text-gray-400 outline-none bg-transparent [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
            }}
            aria-label="Search input"
          />
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 z-10"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 sm:px-8 py-4 h-auto font-semibold rounded-r-2xl rounded-l-none flex-shrink-0 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          aria-label="Submit search"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.keywords.length > 0 || suggestions.gigs.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl max-h-[420px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="overflow-y-auto max-h-[420px]">
            {/* Keywords Section */}
            {suggestions.keywords.length > 0 && (
              <div className="p-3 border-b border-gray-100/80">
                <div className="flex items-center gap-2 px-2 py-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Keywords</span>
                </div>
                <div className="space-y-0.5">
                  {suggestions.keywords.map((keyword, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(keyword);
                        router.push(`/search?q=${encodeURIComponent(keyword)}`);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50/50 hover:text-green-600 rounded-lg transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Search className="h-3.5 w-3.5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        <span className="font-medium">{keyword}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gigs Section */}
            {suggestions.gigs.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 px-2 py-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <Package className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Gigs</span>
                </div>
                <div className="space-y-1.5">
                  {suggestions.gigs.map((gig) => (
                    <Link
                      key={gig.id}
                      href={`/gigs/${gig.id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-3 py-3 hover:bg-green-50/50 rounded-xl transition-all duration-150 group border border-transparent hover:border-green-100"
                    >
                      {gig.images && Array.isArray(gig.images) && gig.images.length > 0 ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                          <img
                            src={gig.images[0]}
                            alt={gig.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate mb-1">
                          {gig.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {gig.seller && (
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4 border border-gray-200 shadow-sm">
                                <AvatarImage src={gig.seller.avatarUrl || ""} alt={gig.seller.username} />
                                <AvatarFallback className="text-[8px] bg-gradient-to-br from-green-600 to-green-700 text-white">
                                  {gig.seller.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500 font-medium">{gig.seller.username}</span>
                            </div>
                          )}
                          {gig.category && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-500 font-medium">{gig.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-green-600">
                          {Number(gig.basePricePi).toFixed(2)} <span className="text-green-500">π</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loadingSuggestions && (
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading suggestions...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

