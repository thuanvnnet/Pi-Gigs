"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X, Filter, ChevronDown, TrendingUp, Package } from "lucide-react";
import { getAllCategoriesFlat } from "@/app/actions/category";
import { SearchFilters, SortOption, getSearchSuggestions } from "@/app/actions/search";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  priceRange?: { minPrice: number; maxPrice: number };
}

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  priceRange,
}: SearchFiltersProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localQuery, setLocalQuery] = useState(filters.query || "");
  const [suggestions, setSuggestions] = useState<{ keywords: string[]; gigs: any[] }>({ keywords: [], gigs: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(localQuery, 300);

  useEffect(() => {
    loadCategories();
  }, []);

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

  const loadCategories = async () => {
    try {
      const result = await getAllCategoriesFlat();
      if (result.success) {
        setCategories(result.categories || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

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

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" || value === undefined ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setLocalQuery("");
  };

  const handleSearch = () => {
    updateFilter("query", localQuery);
  };

  const hasActiveFilters = 
    filters.query ||
    filters.categoryId ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating !== undefined ||
    filters.deliveryDays !== undefined;

  const minPrice = priceRange?.minPrice || 0;
  const maxPrice = priceRange?.maxPrice || 1000;

  return (
    <Card className="bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-xl rounded-2xl">
      <CardContent className="p-5 sm:p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={searchInputRef}
                placeholder="Search gigs by title or description..."
                value={localQuery}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (localQuery.trim().length >= 2 && (suggestions.keywords.length > 0 || suggestions.gigs.length > 0)) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                    setShowSuggestions(false);
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                className="pl-5 pr-10 h-11 border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 rounded-xl"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalQuery("");
                    updateFilter("query", undefined);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 z-10"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && (suggestions.keywords.length > 0 || suggestions.gigs.length > 0) && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-xl shadow-2xl max-h-[420px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
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
                                setLocalQuery(keyword);
                                updateFilter("query", keyword);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50/50 hover:text-[#31BF75] rounded-lg transition-all duration-150 group"
                            >
                              <div className="flex items-center gap-2.5">
                                <Search className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#31BF75] transition-colors" />
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
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#31BF75] transition-colors truncate mb-1">
                                  {gig.title}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {gig.seller && (
                                    <div className="flex items-center gap-1.5">
                                      <Avatar className="h-4 w-4 border border-gray-200 shadow-sm">
                                        <AvatarImage src={gig.seller.avatarUrl || ""} alt={gig.seller.username} />
                                        <AvatarFallback className="text-[8px] bg-gradient-to-br from-[#31BF75] to-[#27995E] text-white">
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
                                <p className="text-sm font-bold text-[#31BF75]">
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
                        <div className="h-4 w-4 border-2 border-[#31BF75] border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading suggestions...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-[#31BF75] to-[#27995E] text-white hover:shadow-lg hover:shadow-[#31BF75]/30 h-11 px-6 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Category Filter */}
          <div>
            <Label className="text-xs font-bold text-gray-700 mb-2.5 block">Category</Label>
            <Select
              value={filters.categoryId?.toString() || undefined}
              onValueChange={(value) => {
                if (value) {
                  updateFilter("categoryId", parseInt(value));
                } else {
                  updateFilter("categoryId", undefined);
                }
              }}
              disabled={loadingCategories}
            >
              <SelectTrigger className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 h-10 rounded-lg">
                <SelectValue placeholder={loadingCategories ? "Loading..." : "All Categories"} />
              </SelectTrigger>
              <SelectContent className="bg-white/98 backdrop-blur-md border-gray-200 shadow-xl z-[100]">
                {loadingCategories ? (
                  <div className="p-4 text-center text-sm text-gray-500">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No categories available</div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <Label className="text-xs font-bold text-gray-700 mb-2.5 block">Sort By</Label>
            <Select
              value={filters.sortBy || "date_desc"}
              onValueChange={(value) => updateFilter("sortBy", value as SortOption)}
            >
              <SelectTrigger className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/98 backdrop-blur-md border-gray-200 shadow-xl z-[100]">
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating_desc">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div>
            <Label className="text-xs font-bold text-gray-700 mb-2.5 block">Min Price (π)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice || ""}
              onChange={(e) => updateFilter("minPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
              className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 h-10 rounded-lg"
            />
          </div>

          {/* Max Price */}
          <div>
            <Label className="text-xs font-bold text-gray-700 mb-2.5 block">Max Price (π)</Label>
            <Input
              type="number"
              placeholder="1000"
              value={filters.maxPrice || ""}
              onChange={(e) => updateFilter("maxPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
              className="border-gray-300 focus:border-[#31BF75] focus:ring-[#31BF75]/20 h-10 rounded-lg"
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-200/60">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#31BF75] transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-green-50 transition-colors">
              <Filter className="h-4 w-4 text-gray-600 group-hover:text-[#31BF75]" />
            </div>
            <span>Advanced Filters</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200 text-gray-500",
                showAdvanced && "rotate-180"
              )}
            />
          </button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-3 w-3 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-5 pt-5 border-t border-gray-200/60 space-y-5">
            {/* Min Rating */}
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-3 block">
                Minimum Rating: <span className="text-[#31BF75] font-semibold">{filters.minRating || 0}</span> ⭐
              </Label>
              <Slider
                value={[filters.minRating || 0]}
                onValueChange={([value]) => updateFilter("minRating", value > 0 ? value : undefined)}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Delivery Days */}
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-3 block">
                Max Delivery Days: <span className="text-[#31BF75] font-semibold">{filters.deliveryDays || "Any"}</span>
              </Label>
              <Slider
                value={[filters.deliveryDays || 30]}
                onValueChange={([value]) => updateFilter("deliveryDays", value < 30 ? value : undefined)}
                max={30}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
