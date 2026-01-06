"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchGigs, getPriceRange, SearchFilters } from "@/app/actions/search";
import { SearchFiltersComponent } from "@/components/search/search-filters";
import { GigCard } from "@/components/gigs/gig-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search as SearchIcon, Package } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [priceRange, setPriceRange] = useState<{ minPrice: number; maxPrice: number } | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || undefined,
    categoryId: searchParams.get("category") ? parseInt(searchParams.get("category")!) : undefined,
    minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
    minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
    deliveryDays: searchParams.get("deliveryDays") ? parseInt(searchParams.get("deliveryDays")!) : undefined,
    sortBy: (searchParams.get("sortBy") as any) || "date_desc",
  });

  const [page, setPage] = useState(1);
  const limit = 20;

  // Load price range on mount
  useEffect(() => {
    loadPriceRange();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.categoryId) params.set("category", filters.categoryId.toString());
    if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.minRating !== undefined) params.set("minRating", filters.minRating.toString());
    if (filters.deliveryDays !== undefined) params.set("deliveryDays", filters.deliveryDays.toString());
    if (filters.sortBy) params.set("sortBy", filters.sortBy);

    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Debounce search to avoid too many requests
  const debouncedFilters = useDebounce(filters, 500);

  // Load gigs when filters change
  useEffect(() => {
    loadGigs();
  }, [debouncedFilters, page]);

  const loadPriceRange = async () => {
    const result = await getPriceRange();
    if (result.success) {
      setPriceRange({ minPrice: result.minPrice, maxPrice: result.maxPrice });
    }
  };

  const loadGigs = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const result = await searchGigs(debouncedFilters, limit, offset);
      
      if (result.success) {
        if (page === 1) {
          setGigs(result.gigs || []);
        } else {
          setGigs((prev) => [...prev, ...(result.gigs || [])]);
        }
        setTotal(result.total || 0);
      } else {
        console.error("Search error:", result.error);
      }
    } catch (error) {
      console.error("Error loading gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const hasMore = gigs.length < total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Search Gigs</h1>
          <p className="text-gray-600">
            {total > 0 ? (
              <>
                Found <span className="font-semibold text-[#31BF75]">{total}</span> gig{total !== 1 ? "s" : ""}
                {filters.query && ` for "${filters.query}"`}
              </>
            ) : (
              "Search and filter gigs to find what you need"
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            priceRange={priceRange || undefined}
          />
        </div>

        {/* Results */}
        {loading && page === 1 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#31BF75]" />
          </div>
        ) : gigs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No gigs found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {filters.query || Object.keys(filters).length > 1
                  ? "Try adjusting your search or filters"
                  : "Start searching to find gigs"}
              </p>
              {filters.query && (
                <Button
                  onClick={() => handleFiltersChange({})}
                  variant="outline"
                  size="sm"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
