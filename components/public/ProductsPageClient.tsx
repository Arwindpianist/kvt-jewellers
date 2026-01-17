"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ProductCard } from "@/components/public/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Filter, X, Search, ChevronLeft, ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import type { Product, ProductCategory } from "@/types/products";
import { categoryGroups, categoryConfig } from "@/lib/product-categories";
import { useCurrency } from "@/lib/currency-context";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";

interface ProductsPageClientProps {}

type SortOption = "newest" | "price-low" | "price-high" | "name-asc" | "name-desc";

type PriceRangePreset = "all" | "under-1000" | "1000-5000" | "5000-10000" | "10000-20000" | "over-20000";

const priceRangePresets: Array<{ value: PriceRangePreset; label: string; range: [number, number] }> = [
  { value: "all", label: "All Prices", range: [0, Infinity] },
  { value: "under-1000", label: "Under RM 1,000", range: [0, 1000] },
  { value: "1000-5000", label: "RM 1,000 - RM 5,000", range: [1000, 5000] },
  { value: "5000-10000", label: "RM 5,000 - RM 10,000", range: [5000, 10000] },
  { value: "10000-20000", label: "RM 10,000 - RM 20,000", range: [10000, 20000] },
  { value: "over-20000", label: "RM 20,000+", range: [20000, Infinity] },
];

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function ProductsPageClient({}: ProductsPageClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all" | "investment" | "jewelry">("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRangePreset>("all");
  const [selectedPurity, setSelectedPurity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["investment", "jewelry"]));
  const [allPurities, setAllPurities] = useState<string[]>([]);
  const { currency } = useCurrency();
  const [prevCurrency, setPrevCurrency] = useState<"USD" | "MYR" | "INR">(currency);

  // Calculate price range from selected preset
  const priceRange = useMemo(() => {
    const preset = priceRangePresets.find((p) => p.value === selectedPriceRange);
    return preset ? preset.range : [0, Infinity];
  }, [selectedPriceRange]);

  // Track currency changes to show price loading animation
  useEffect(() => {
    if (prevCurrency !== currency) {
      if (products.length > 0) {
        // Currency changed and we have products - show price loading
        setPriceLoading(true);
      }
      setPrevCurrency(currency);
    }
  }, [currency, prevCurrency, products.length]);

  // Abort controller ref for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch products from API
  const fetchProducts = useCallback(async (page: number = 1) => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Only set main loading on initial load or page change, not on currency change
    if (page === 1 && products.length === 0) {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        sortBy: sortBy,
        currency: currency,
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const currentPriceRange = priceRangePresets.find((p) => p.value === selectedPriceRange)?.range || [0, Infinity];
      if (selectedPriceRange !== "all") {
        params.append("priceMin", currentPriceRange[0].toString());
        if (currentPriceRange[1] !== Infinity) {
          params.append("priceMax", currentPriceRange[1].toString());
        }
      }

      if (selectedPurity !== "all") {
        params.append("purity", selectedPurity);
      }

      // OPTIMIZATION: Only add cache-busting for currency changes if products already loaded
      // For initial load or filter changes, use normal fetch (server handles caching)
      if (products.length > 0 && prevCurrency !== currency) {
        params.append("_t", Date.now().toString());
      }
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        // OPTIMIZATION: Server-side caching is handled by the API route
        // Client-side: only prevent cache on currency changes when products already loaded
        cache: (products.length > 0 && prevCurrency !== currency) ? "no-store" : "default",
        signal: abortController.signal,
      });
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to fetch products";
        const errorDetails = data.details ? `: ${data.details}` : "";
        // Only log in development to reduce memory usage
        if (process.env.NODE_ENV === 'development') {
          console.error("API Error:", errorMessage, errorDetails, data);
        }
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      // Check if request was aborted before setting state
      if (abortController.signal.aborted) {
        return;
      }
      
      setProducts(data.products || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    } catch (error) {
      // Ignore abort errors, only log other errors in development
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      // Only log in development to reduce memory usage
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching products:", error);
      }
      // Only set state if not aborted
      if (!abortController.signal.aborted) {
        setProducts([]);
      }
    } finally {
      // Only update loading state if not aborted
      if (!abortController.signal.aborted) {
        setLoading(false);
        setPriceLoading(false); // Hide price loading animation when products are loaded
      }
    }
  }, [searchQuery, selectedCategory, selectedPriceRange, selectedPurity, sortBy, currency, products.length]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch all purities for filter (one-time fetch) - OPTIMIZED: uses dedicated endpoint
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    const fetchPurities = async () => {
      try {
        // OPTIMIZATION: Use dedicated purities endpoint instead of fetching 100 products
        const response = await fetch("/api/products/purities", {
          signal: abortController.signal,
          next: { revalidate: 3600 }, // Cache for 1 hour
        });
        const data = await response.json();
        if (isMounted && data.purities) {
          setAllPurities(data.purities);
        }
      } catch (error) {
        // Only log in development and ignore abort errors
        if (process.env.NODE_ENV === 'development' && error instanceof Error && error.name !== 'AbortError') {
          console.error("Error fetching purities:", error);
        }
      }
    };
    fetchPurities();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  // Debounced search and filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedPriceRange, selectedPurity, sortBy, currency, fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProducts]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setSelectedPurity("all");
    setSortBy("newest");
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== "all") count++;
    if (selectedPriceRange !== "all") count++;
    if (selectedPurity !== "all") count++;
    return count;
  }, [searchQuery, selectedCategory, selectedPriceRange, selectedPurity]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <label className="text-sm font-semibold mb-3 block text-foreground">Category</label>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {/* All Products */}
          <button
            onClick={() => {
              setSelectedCategory("all");
              fetchProducts(1);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
              selectedCategory === "all"
                ? "bg-brand-600 text-white"
                : "hover:bg-muted"
            }`}
          >
            <span>All Products</span>
            <span className="text-xs opacity-70">({pagination.total})</span>
          </button>

          {/* Investment Products Group */}
          <div>
            <button
              onClick={() => setExpandedGroups((prev) => {
                const newSet = new Set(prev);
                if (newSet.has("investment")) {
                  newSet.delete("investment");
                } else {
                  newSet.add("investment");
                }
                return newSet;
              })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === "investment"
                  ? "bg-brand-600 text-white"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                {expandedGroups.has("investment") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>Investment Products</span>
              </div>
            </button>
            {expandedGroups.has("investment") && (
              <div className="ml-4 mt-1 space-y-1">
                {categoryGroups.investment.categories.map((cat) => {
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        fetchProducts(1);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors ${
                        selectedCategory === cat
                          ? "bg-brand-500 text-white"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span>{categoryConfig[cat].label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Jewelry Group */}
          <div>
            <button
              onClick={() => setExpandedGroups((prev) => {
                const newSet = new Set(prev);
                if (newSet.has("jewelry")) {
                  newSet.delete("jewelry");
                } else {
                  newSet.add("jewelry");
                }
                return newSet;
              })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === "jewelry"
                  ? "bg-brand-600 text-white"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                {expandedGroups.has("jewelry") ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>Jewelry</span>
              </div>
            </button>
            {expandedGroups.has("jewelry") && (
              <div className="ml-4 mt-1 space-y-1">
                {categoryGroups.jewelry.categories.map((cat) => {
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        fetchProducts(1);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors ${
                        selectedCategory === cat
                          ? "bg-brand-500 text-white"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span>{categoryConfig[cat].label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div>
        <label className="text-sm font-semibold mb-3 block text-foreground">Price Range</label>
        <div className="space-y-2">
          {priceRangePresets.map((preset) => (
            <Button
              key={preset.value}
              variant={selectedPriceRange === preset.value ? "default" : "outline"}
              className={`w-full justify-start h-10 transition-all duration-200 ${
                selectedPriceRange === preset.value
                  ? "!bg-brand-600 !text-white hover:!bg-brand-700"
                  : "hover:bg-muted"
              }`}
              onClick={() => {
                setSelectedPriceRange(preset.value);
                fetchProducts(1);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Purity Filter */}
      {allPurities.length > 0 && (
        <>
          <div>
            <label className="text-sm font-semibold mb-3 block text-foreground">Purity</label>
            <Select value={selectedPurity} onValueChange={(value) => {
              setSelectedPurity(value);
              fetchProducts(1);
            }}>
              <SelectTrigger className="h-10 transition-all duration-200">
                <SelectValue placeholder="All purities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purities</SelectItem>
                {allPurities.map((purity) => (
                  <SelectItem key={purity} value={purity}>
                    {purity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
        </>
      )}

      {/* Sort Options */}
      <div>
        <label className="text-sm font-semibold mb-3 block text-foreground">Sort By</label>
        <Select value={sortBy} onValueChange={(value) => {
          setSortBy(value as SortOption);
          fetchProducts(1);
        }}>
          <SelectTrigger className="h-10 transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button variant="outline" onClick={clearFilters} className="w-full h-10 transition-all duration-200">
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  // Pagination component
  const PaginationControls = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={!pagination.hasPreviousPage}
          className="h-9"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              className="h-9"
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            variant={page === pagination.page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            className={`h-9 ${page === pagination.page ? "bg-brand-600" : ""}`}
          >
            {page}
          </Button>
        ))}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              className="h-9"
            >
              {pagination.totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="h-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.totalPages)}
          disabled={!pagination.hasNextPage}
          className="h-9"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon" className="shrink-0 relative transition-all duration-200">
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Sidebar Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="hidden lg:flex shrink-0 relative transition-all duration-200"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 transition-all duration-200"
              />
            </div>

            {/* Results Count */}
            <div className="hidden sm:block text-sm text-muted-foreground whitespace-nowrap transition-all duration-200">
              {loading && products.length === 0 ? (
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <>
                  {pagination.total} {pagination.total === 1 ? "product" : "products"}
                  {pagination.totalPages > 1 && (
                    <span className="ml-1">
                      (Page {pagination.page} of {pagination.totalPages})
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Active Filters Bar */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 transition-all duration-200">
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1 h-7 px-2 transition-all duration-200">
                  {selectedCategory === "investment" ? "Investment Products" : 
                   selectedCategory === "jewelry" ? "Jewelry" : 
                   categoryConfig[selectedCategory as ProductCategory]?.label || selectedCategory}
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      fetchProducts(1);
                    }}
                    className="ml-1 rounded-full hover:bg-muted p-0.5 transition-all duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedPriceRange !== "all" && (
                <Badge variant="secondary" className="gap-1 h-7 px-2 transition-all duration-200">
                  {priceRangePresets.find((p) => p.value === selectedPriceRange)?.label}
                  <button
                    onClick={() => {
                      setSelectedPriceRange("all");
                      fetchProducts(1);
                    }}
                    className="ml-1 rounded-full hover:bg-muted p-0.5 transition-all duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedPurity !== "all" && (
                <Badge variant="secondary" className="gap-1 h-7 px-2 transition-all duration-200">
                  {selectedPurity}
                  <button
                    onClick={() => {
                      setSelectedPurity("all");
                      fetchProducts(1);
                    }}
                    className="ml-1 rounded-full hover:bg-muted p-0.5 transition-all duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside
            className={`hidden lg:block transition-all duration-300 ease-in-out ${
              showSidebar ? "w-80" : "w-0"
            } overflow-hidden`}
          >
            {showSidebar && (
              <Card className="sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSidebar(false)}
                      className="h-8 w-8 transition-all duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <FilterContent />
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={pagination.limit || 25} />
            ) : products.length === 0 ? (
              <div className="py-16 text-center animate-in fade-in duration-300">
                <p className="mb-4 text-lg text-muted-foreground">
                  No products found matching your criteria.
                </p>
                <Button variant="outline" onClick={clearFilters} className="transition-all duration-200">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} priceLoading={priceLoading} />
                  ))}
                </div>
                <PaginationControls />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
