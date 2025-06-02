// src/pages/products.tsx
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorMessage } from "@/components/ui/error-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
} from "@/hooks/use-api";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unit?: string;
}

const UNITS = [
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "lbs", label: "Pounds" },
  { value: "box", label: "Box" },
  { value: "dozen", label: "Dozen" },
  { value: "liters", label: "Liters" },
  { value: "meters", label: "Meters" },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const pageSize = 10;

  // API hooks
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useProducts({
    page: currentPage,
    pageSize,
    searchTerm: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Form state
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    unit: "pcs",
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === "all" ? "" : categoryId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      sku: "",
      barcode: "",
      price: 0,
      costPrice: 0,
      stockQuantity: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      unit: "pcs",
    });
    setEditingProduct(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      sku: product.sku,
      barcode: product.barcode || "",
      categoryId: product.categoryId || "",
      price: product.price,
      costPrice: product.costPrice || 0,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel || 0,
      maxStockLevel: product.maxStockLevel || 0,
      unit: product.unit || "pcs",
    });
    setEditingProduct(product);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.sku.trim()) {
      toast.error("SKU is required");
      return;
    }

    if (formData.price < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    if (formData.stockQuantity < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          data: formData,
        });
        toast.success("Product updated successfully!");
      } else {
        await createProductMutation.mutateAsync(formData);
        toast.success("Product created successfully!");
      }
      setIsCreateModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProductMutation.mutateAsync(deletingProduct.id);
      toast.success("Product deleted successfully!");
      setDeletingProduct(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "discontinued":
        return "destructive";
      case "outofstock":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStockStatus = (product: any) => {
    if (product.stockQuantity === 0) return "Out of Stock";
    if (product.minStockLevel && product.stockQuantity <= product.minStockLevel)
      return "Low Stock";
    return "In Stock";
  };

  const getStockColor = (product: any) => {
    if (product.stockQuantity === 0) return "destructive";
    if (product.minStockLevel && product.stockQuantity <= product.minStockLevel)
      return "outline";
    return "default";
  };

  const getCategoryName = (categoryId: string) => {
    return (
      categoriesData?.categories?.find((c) => c.id === categoryId)?.name ||
      "Unknown Category"
    );
  };

  if (isLoading) {
    return <LoadingScreen message="Loading products..." />;
  }

  if (error) {
    return (
      <PageWrapper title="Products" description="Manage your product inventory">
        <ErrorMessage
          title="Failed to load products"
          message="There was an error loading your products. Please try again."
          onRetry={() => refetch()}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Products"
      description="Manage your product inventory"
      action={
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      }
    >
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products by name, SKU, or description..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Select
                    value={selectedCategory || "all"}
                    onValueChange={handleCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoriesData?.categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(searchTerm || selectedCategory) && (
                  <div className="text-sm text-gray-500 flex items-center">
                    {searchTerm && `"${searchTerm}"`}
                    {searchTerm && selectedCategory && " in "}
                    {selectedCategory &&
                      categoriesData?.categories?.find(
                        (c) => c.id === selectedCategory
                      )?.name}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productsData?.totalCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {productsData?.totalCount === 1 ? "product" : "products"} in
              inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {productsData?.products?.filter(
                (p) => p.minStockLevel && p.stockQuantity <= p.minStockLevel
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              items need restocking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products
            {productsData && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({productsData.totalCount} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!productsData?.products || productsData.products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by adding your first product"}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                          Product
                        </th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                          SKU
                        </th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                          Category
                        </th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                          Price
                        </th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                          Stock
                        </th>
                        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-10 px-2 text-right align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {productsData.products.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-2 align-middle">
                            <div>
                              <div className="font-medium text-gray-900">
                                {product.name}
                              </div>
                              {product.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2 align-middle font-mono text-sm">
                            {product.sku}
                          </td>
                          <td className="p-2 align-middle">
                            {product.categoryName || (
                              <span className="text-gray-400">
                                Uncategorized
                              </span>
                            )}
                          </td>
                          <td className="p-2 align-middle">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {formatCurrency(product.price)}
                              </div>
                              {product.costPrice && (
                                <div className="text-xs text-gray-500">
                                  Cost: {formatCurrency(product.costPrice)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2 align-middle">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {product.stockQuantity} {product.unit || "pcs"}
                              </div>
                              <Badge
                                variant={getStockColor(product)}
                                className="text-xs"
                              >
                                {getStockStatus(product)}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-2 align-middle">
                            <Badge variant={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                          </td>
                          <td className="p-2 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditModal(product)}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeletingProduct(product)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {productsData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, productsData.totalCount)}{" "}
                    of {productsData.totalCount} products
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!productsData.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!productsData.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Product Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product information below."
                : "Add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  placeholder="Product SKU"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: value === "none" ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categoriesData?.categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriesLoading && (
                  <p className="text-xs text-gray-500">Loading categories...</p>
                )}
                {categoriesError && (
                  <p className="text-xs text-red-500">
                    Failed to load categories
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      barcode: e.target.value,
                    }))
                  }
                  placeholder="Product barcode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, unit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      costPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stockQuantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minStockLevel: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                <Input
                  id="maxStockLevel"
                  type="number"
                  value={formData.maxStockLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxStockLevel: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deletingProduct}
        onOpenChange={() => setDeletingProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProductMutation.isPending}
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
