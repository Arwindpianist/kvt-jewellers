"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ProductManagerSkeleton } from "@/components/staff/skeletons/ProductManagerSkeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Download, Upload, Loader2, AlertCircle, Grid3x3, List, XCircle } from "lucide-react";
import { logger } from "@/lib/logger";
import type { Product, ProductCategory } from "@/types/products";
import {
  categoryConfig,
  categoryGroups,
  metalTypes,
  purityOptions,
  designStyles,
  finishOptions,
  stoneTypes,
  type MetalType,
} from "@/lib/product-categories";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductManagerProps {
  initialProducts?: Product[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function ProductManager({ initialProducts = [] }: ProductManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: initialProducts.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "">("");
  const [metalTypeFilter, setMetalTypeFilter] = useState<MetalType | "">("");
  const [priceMinFilter, setPriceMinFilter] = useState("");
  const [priceMaxFilter, setPriceMaxFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "name-asc" | "name-desc" | "price-low" | "price-high">("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkEditDialog, setBulkEditDialog] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    category: "" as ProductCategory | "",
    metalType: "" as MetalType | "",
    active: undefined as boolean | undefined,
  });
  const [importing, setImporting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null,
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Fetch products with pagination and filters
  const fetchProducts = async (
    page: number = 1,
    search: string = "",
    category: ProductCategory | "" = "",
    metalType: MetalType | "" = "",
    priceMin: string = "",
    priceMax: string = "",
    sort: typeof sortBy = "newest"
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      
      if (search) {
        params.append("search", search);
      }
      
      if (category) {
        params.append("category", category);
      }

      if (metalType) {
        params.append("metalType", metalType);
      }

      if (priceMin) {
        params.append("priceMin", priceMin);
      }

      if (priceMax) {
        params.append("priceMax", priceMax);
      }

      if (sort) {
        params.append("sortBy", sort);
      }

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
      setPagination(data.pagination || pagination);
      // Clear selections when products change
      setSelectedProducts(new Set());
    } catch (error) {
      logger.error("Error fetching products", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts(1, searchQuery, categoryFilter, metalTypeFilter, priceMinFilter, priceMaxFilter, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Handle search and filters with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, searchQuery, categoryFilter, metalTypeFilter, priceMinFilter, priceMaxFilter, sortBy);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter, metalTypeFilter, priceMinFilter, priceMaxFilter, sortBy]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchProducts(page, searchQuery, categoryFilter, metalTypeFilter, priceMinFilter, priceMaxFilter, sortBy);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (categoryFilter) count++;
    if (metalTypeFilter) count++;
    if (priceMinFilter) count++;
    if (priceMaxFilter) count++;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setCategoryFilter("");
    setMetalTypeFilter("");
    setPriceMinFilter("");
    setPriceMaxFilter("");
    setSearchQuery("");
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selectedProducts.size === 0) return;

    try {
      setError("");
      setSuccess("");

      const updates: any = {};
      if (bulkEditData.category) updates.category = bulkEditData.category;
      if (bulkEditData.metalType) updates.metalType = bulkEditData.metalType;
      if (bulkEditData.active !== undefined) updates.active = bulkEditData.active;

      if (Object.keys(updates).length === 0) {
        setError("Please select at least one field to update");
        return;
      }

      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update products");
      }

      const data = await response.json();
      setSuccess(`Successfully updated ${data.summary.success} product(s)`);
      setTimeout(() => setSuccess(""), 5000);
      setBulkEditDialog(false);
      setBulkEditData({ category: "", metalType: "", active: undefined });
      setSelectedProducts(new Set());
      fetchProducts(pagination.page, searchQuery, categoryFilter, metalTypeFilter, priceMinFilter, priceMaxFilter, sortBy);
    } catch (error) {
      logger.error("Error bulk updating products", error);
      setError(error instanceof Error ? error.message : "Failed to update products");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete products");
      }

      const data = await response.json();
      setSuccess(`Successfully deleted ${data.deleted} product(s)`);
      setTimeout(() => setSuccess(""), 5000);
      setBulkDeleteDialog(false);
      setSelectedProducts(new Set());
      fetchProducts(pagination.page, searchQuery, categoryFilter, metalTypeFilter, priceMinFilter, priceMaxFilter, sortBy);
    } catch (error) {
      logger.error("Error bulk deleting products", error);
      setError(error instanceof Error ? error.message : "Failed to delete products");
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export/products");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess("Products exported successfully");
    } catch (error) {
      logger.error("Error exporting products", error);
      setError("Failed to export products. Please try again.");
    }
  };


  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ open: true, productId: id });
  };

  const handleDelete = async () => {
    if (!deleteDialog.productId) return;

    try {
      const response = await fetch(`/api/products?id=${deleteDialog.productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setSuccess("Product deleted successfully");
      setTimeout(() => setSuccess(""), 5000);
      setError("");
      setDeleteDialog({ open: false, productId: null });
      fetchProducts(pagination.page, searchQuery, categoryFilter, metalTypeFilter, priceMinFilter, priceMaxFilter, sortBy);
    } catch (error) {
      logger.error("Error deleting product", error);
      setError("Failed to delete product. Please try again.");
      setDeleteDialog({ open: false, productId: null });
    }
  };

  const handleEdit = (product: Product) => {
    router.push(`/staff/products/${product.id}/edit`);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading && products.length === 0) {
    return <ProductManagerSkeleton />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-brand-700">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {products.length} of {pagination.total} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatedButton
            onClick={handleExport}
            size="sm"
            variant="outline"
            className="rounded-lg border-brand-300 hover:bg-brand-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </AnimatedButton>
          <AnimatedButton
            onClick={async () => {
              if (!confirm("This will create/update sample products with images. Continue?")) return;
              setImporting(true);
              setError("");
              setSuccess("");
              try {
                const response = await fetch("/api/admin/seed-products", {
                  method: "POST",
                });
                const data = await response.json();
                if (!response.ok) {
                  throw new Error(data.error || "Failed to seed products");
                }
                setSuccess(`Successfully seeded ${data.successCount} products!`);
                fetchProducts(pagination.page, searchQuery, categoryFilter);
              } catch (error) {
                logger.error("Error seeding products", error);
                setError(error instanceof Error ? error.message : "Failed to seed products");
              } finally {
                setImporting(false);
              }
            }}
            size="sm"
            variant="outline"
            className="rounded-lg border-brand-300 hover:bg-brand-50"
            disabled={importing}
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Seed Products
              </>
            )}
          </AnimatedButton>
          <AnimatedButton
            onClick={() => router.push("/staff/products/new")}
            className="gold-gradient-button rounded-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </AnimatedButton>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className="h-10"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-10"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | "")}
              >
                <option value="">All Categories</option>
                <optgroup label="Investment Products">
                  {categoryGroups.investment.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Jewelry">
                  {categoryGroups.jewelry.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat].label}
                    </option>
                  ))}
                </optgroup>
              </select>

              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={metalTypeFilter}
                onChange={(e) => setMetalTypeFilter(e.target.value as MetalType | "")}
              >
                <option value="">All Metal Types</option>
                {metalTypes.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Min Price (MYR)"
                value={priceMinFilter}
                onChange={(e) => setPriceMinFilter(e.target.value)}
                className="h-10"
              />

              <Input
                type="number"
                placeholder="Max Price (MYR)"
                value={priceMaxFilter}
                onChange={(e) => setPriceMaxFilter(e.target.value)}
                className="h-10"
              />

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Chips */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {categoryFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {categoryConfig[categoryFilter]?.label || categoryFilter}
                    <XCircle
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setCategoryFilter("")}
                    />
                  </Badge>
                )}
                {metalTypeFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Metal: {metalTypes.find(mt => mt.value === metalTypeFilter)?.label || metalTypeFilter}
                    <XCircle
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setMetalTypeFilter("")}
                    />
                  </Badge>
                )}
                {priceMinFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Min: MYR {priceMinFilter}
                    <XCircle
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setPriceMinFilter("")}
                    />
                  </Badge>
                )}
                {priceMaxFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Max: MYR {priceMaxFilter}
                    <XCircle
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setPriceMaxFilter("")}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 text-xs"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AnimatedSection>
        <Card className="border-2 border-brand-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                All Products ({pagination.total})
              </CardTitle>
              {selectedProducts.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedProducts.size} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBulkEditDialog(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Bulk Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBulkDeleteDialog(true)}
                    className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600 dark:!bg-destructive dark:!text-destructive-foreground"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : viewMode === "table" ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-brand-200/50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedProducts.size === products.length && products.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="font-semibold text-brand-700">Image</TableHead>
                        <TableHead className="font-semibold text-brand-700">Name</TableHead>
                        <TableHead className="font-semibold text-brand-700">Category</TableHead>
                        <TableHead className="font-semibold text-brand-700">Price</TableHead>
                        <TableHead className="font-semibold text-brand-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border-brand-100 hover:bg-brand-50/50 ${selectedProducts.has(product.id) ? "bg-brand-100/30" : ""}`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.has(product.id)}
                              onCheckedChange={() => toggleProductSelection(product.id)}
                            />
                          </TableCell>
                          <TableCell>
                            {product.images && product.images.length > 0 && product.images[0] ? (
                              <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-brand-200 bg-brand-50 shadow-sm">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  quality={25}
                                  sizes="64px"
                                  loading="lazy"
                                  unoptimized={product.images[0]?.includes('supabase.co') || product.images[0]?.includes('storage')}
                                />
                              </div>
                            ) : (
                              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 shadow-sm">
                                <div className="flex h-full items-center justify-center">
                                  <span className="text-2xl">
                                    {categoryConfig[product.category]?.group === "investment" ? "🪙" : "💍"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-brand-300 bg-brand-50 text-brand-700">
                              {categoryConfig[product.category]?.label || product.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {product.price ? (
                              <span className="font-semibold gold-gradient-text">
                                {new Intl.NumberFormat("en-MY", {
                                  style: "currency",
                                  currency: "MYR",
                                }).format(product.price)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <AnimatedButton
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(product)}
                                className="rounded-lg border-brand-300 hover:bg-brand-50"
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </AnimatedButton>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClick(product.id)}
                                className="rounded-lg !bg-red-600 hover:!bg-red-700 !text-white border-red-600 dark:!bg-destructive dark:!text-destructive-foreground"
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <>
                {/* Grid View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow ${
                        selectedProducts.has(product.id) ? "ring-2 ring-brand-500" : ""
                      }`}
                    >
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                      </div>
                      <div className="relative aspect-square w-full overflow-hidden bg-muted">
                        {product.images && product.images.length > 0 && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            quality={25}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            loading="lazy"
                            unoptimized={product.images[0]?.includes('supabase.co') || product.images[0]?.includes('storage')}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                            <span className="text-4xl">
                              {categoryConfig[product.category]?.group === "investment" ? "🪙" : "💍"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {categoryConfig[product.category]?.label || product.category}
                          </Badge>
                          {product.price && (
                            <span className="font-semibold text-sm gold-gradient-text">
                              {new Intl.NumberFormat("en-MY", {
                                style: "currency",
                                currency: "MYR",
                                maximumFractionDigits: 0,
                              }).format(product.price)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(product.id)}
                            className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600 dark:!bg-destructive dark:!text-destructive-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className={!pagination.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {getPageNumbers().map((pageNum, index) => (
                      <PaginationItem key={index}>
                        {pageNum === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={pagination.page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditDialog} onOpenChange={setBulkEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit Products</DialogTitle>
            <DialogDescription>
              Update {selectedProducts.size} selected product(s). Leave fields empty to skip.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Category</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bulkEditData.category}
                onChange={(e) => setBulkEditData({ ...bulkEditData, category: e.target.value as ProductCategory | "" })}
              >
                <option value="">No change</option>
                <optgroup label="Investment Products">
                  {categoryGroups.investment.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Jewelry">
                  {categoryGroups.jewelry.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat].label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <Label>Metal Type</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bulkEditData.metalType}
                onChange={(e) => setBulkEditData({ ...bulkEditData, metalType: e.target.value as MetalType | "" })}
              >
                <option value="">No change</option>
                {metalTypes.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bulkEditData.active === undefined ? "" : bulkEditData.active ? "active" : "inactive"}
                onChange={(e) => setBulkEditData({ ...bulkEditData, active: e.target.value === "" ? undefined : e.target.value === "active" })}
              >
                <option value="">No change</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>
              Update {selectedProducts.size} Product(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialog}
        onOpenChange={setBulkDeleteDialog}
        title="Bulk Delete Products"
        description={`Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleBulkDelete}
        variant="destructive"
      />
    </div>
  );
}
