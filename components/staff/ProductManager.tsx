"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Plus, X, Edit, Trash2, Download, Upload, Loader2, AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";
import type { Product, ProductCategory } from "@/types/products";

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
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null,
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    category: "jewellery" as ProductCategory,
    description: "",
    price: "",
    weight: "",
    purity: "",
  });

  // Fetch products with pagination
  const fetchProducts = async (page: number = 1, search: string = "", category: ProductCategory | "" = "") => {
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

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      logger.error("Error fetching products", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts(1, searchQuery, categoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, searchQuery, categoryFilter);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchProducts(page, searchQuery, categoryFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        images: ["/placeholder-jewelry.jpg"], // In production, handle image uploads
        price: formData.price ? parseFloat(formData.price) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        purity: formData.purity || undefined,
      };

      const response = editing
        ? await fetch("/api/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editing.id, ...productData }),
          })
        : await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      const data = await response.json();
      
      // Refresh products list
      fetchProducts(pagination.page, searchQuery, categoryFilter);

      // Reset form
      setFormData({
        name: "",
        category: "jewellery",
        description: "",
        price: "",
        weight: "",
        purity: "",
      });
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
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
      setError("");
      setDeleteDialog({ open: false, productId: null });
      fetchProducts(pagination.page, searchQuery, categoryFilter);
    } catch (error) {
      logger.error("Error deleting product", error);
      setError("Failed to delete product. Please try again.");
      setDeleteDialog({ open: false, productId: null });
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price?.toString() || "",
      weight: product.weight?.toString() || "",
      purity: product.purity || "",
    });
    setShowForm(true);
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
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              setFormData({
                name: "",
                category: "jewellery",
                description: "",
                price: "",
                weight: "",
                purity: "",
              });
            }}
            className={showForm ? "silver-gradient-button-outline rounded-lg" : "gold-gradient-button rounded-lg"}
          >
            {showForm ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </>
            )}
          </AnimatedButton>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                  {editing ? "Edit Product" : "New Product"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Product Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 border-brand-300 focus:border-brand-500"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                    <select
                      id="category"
                      className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ProductCategory,
                        })
                      }
                    >
                      <option value="coin">Coin</option>
                      <option value="bar">Bar</option>
                      <option value="jewellery">Jewellery</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <textarea
                      id="description"
                      className="mt-1 flex min-h-[100px] w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Enter product description"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-sm font-medium">Price (MYR)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="mt-1 border-brand-300 focus:border-brand-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-sm font-medium">Weight (g)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                        className="mt-1 border-brand-300 focus:border-brand-500"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="purity" className="text-sm font-medium">Purity</Label>
                      <Input
                        id="purity"
                        value={formData.purity}
                        onChange={(e) =>
                          setFormData({ ...formData, purity: e.target.value })
                        }
                        className="mt-1 border-brand-300 focus:border-brand-500"
                        placeholder="916, 999.9, etc."
                      />
                    </div>
                  </div>
                  <AnimatedButton
                    type="submit"
                    className="w-full gold-gradient-button rounded-lg"
                  >
                    {editing ? "Update Product" : "Create Product"}
                  </AnimatedButton>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | "")}
            >
              <option value="">All Categories</option>
              <option value="coin">Coin</option>
              <option value="bar">Bar</option>
              <option value="jewellery">Jewellery</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <AnimatedSection>
        <Card className="border-2 border-brand-200/50 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
            <CardTitle className="font-serif text-xl font-semibold text-brand-700">
              All Products ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-200/50">
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
                      className="border-brand-100 hover:bg-brand-50/50"
                    >
                      <TableCell>
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 shadow-sm">
                          <div className="flex h-full items-center justify-center">
                            <span className="text-2xl">
                              {product.category === "coin" ? "🪙" : product.category === "bar" ? "🥇" : "💍"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-brand-300 bg-brand-50 text-brand-700 capitalize">
                          {product.category}
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
                            variant="destructive"
                            onClick={() => handleDeleteClick(product.id)}
                            className="rounded-lg"
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
              </>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}

