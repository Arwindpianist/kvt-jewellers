"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ProductCard } from "@/components/public/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, X, Search, ChevronLeft } from "lucide-react";
import type { Product, ProductCategory } from "@/types/products";

interface ProductsPageClientProps {
  products: Product[];
}

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

export function ProductsPageClient({ products }: ProductsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRangePreset>("all");
  const [selectedPurity, setSelectedPurity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Calculate price range from selected preset
  const priceRange = useMemo(() => {
    const preset = priceRangePresets.find((p) => p.value === selectedPriceRange);
    return preset ? preset.range : [0, Infinity];
  }, [selectedPriceRange]);

  // Get unique purities from products
  const purities = useMemo(() => {
    const uniquePurities = new Set<string>();
    products.forEach((p) => {
      if (p.purity) uniquePurities.add(p.purity);
    });
    return Array.from(uniquePurities).sort();
  }, [products]);

  // Categories
  const categories = [
    { 
      label: "All",
      value: "all" as const,
      count: products.length,
    },
    { 
      label: "Coins", 
      value: "coin" as ProductCategory,
      count: products.filter((p) => p.category === "coin").length,
    },
    { 
      label: "Bars", 
      value: "bar" as ProductCategory,
      count: products.filter((p) => p.category === "bar").length,
    },
    { 
      label: "Jewelry", 
      value: "jewellery" as ProductCategory,
      count: products.filter((p) => p.category === "jewellery").length,
    },
  ];

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter((p) => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Purity filter
    if (selectedPurity !== "all") {
      filtered = filtered.filter((p) => p.purity === selectedPurity);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return sorted;
  }, [products, searchQuery, selectedCategory, priceRange, selectedPurity, sortBy]);

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
        <Tabs
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as ProductCategory | "all")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 gap-2 h-auto p-1">
            {categories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="text-xs py-2.5 px-2 flex flex-col items-center justify-center gap-0.5 min-h-[3rem]"
              >
                <span className="truncate w-full text-center">{category.label}</span>
                <span className="text-[10px] opacity-70">({category.count})</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
              onClick={() => setSelectedPriceRange(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Purity Filter */}
      {purities.length > 0 && (
        <>
          <div>
            <label className="text-sm font-semibold mb-3 block text-foreground">Purity</label>
            <Select value={selectedPurity} onValueChange={setSelectedPurity}>
              <SelectTrigger className="h-10 transition-all duration-200">
                <SelectValue placeholder="All purities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purities</SelectItem>
                {purities.map((purity) => (
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
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
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
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? "product" : "products"}
            </div>
          </div>

          {/* Active Filters Bar */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 transition-all duration-200">
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1 h-7 px-2 transition-all duration-200">
                  {categories.find((c) => c.value === selectedCategory)?.label}
                  <button
                    onClick={() => setSelectedCategory("all")}
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
                    onClick={() => setSelectedPriceRange("all")}
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
                    onClick={() => setSelectedPurity("all")}
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
            {filteredAndSortedProducts.length === 0 ? (
              <div className="py-16 text-center animate-in fade-in duration-300">
                <p className="mb-4 text-lg text-muted-foreground">
                  No products found matching your criteria.
                </p>
                <Button variant="outline" onClick={clearFilters} className="transition-all duration-200">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
