import { useState } from "react";
import { Plus, Edit2, Trash2, FolderOpen, Folder } from "lucide-react";
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
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-api";
import { toast } from "sonner";

interface CategoryForm {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

export default function CategoriesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);

  // API hooks
  const { data: categoriesData, isLoading, error, refetch } = useCategories();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Form state
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    description: "",
    parentCategoryId: undefined,
  });

  const openCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      parentCategoryId: undefined,
    });
    setEditingCategory(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      parentCategoryId: category.parentCategoryId || undefined,
    });
    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: {
            name: formData.name.trim(),
            description: formData.description?.trim() || undefined,
            parentCategoryId: formData.parentCategoryId || undefined,
          },
        });
        toast.success("Category updated successfully!");
      } else {
        await createCategoryMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          parentCategoryId: formData.parentCategoryId || undefined,
        });
        toast.success("Category created successfully!");
      }
      setIsCreateModalOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      toast.success("Category deleted successfully!");
      setDeletingCategory(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  // Get available parent categories (excluding the category being edited and its children)
  const getAvailableParentCategories = () => {
    if (!categoriesData?.categories) return [];

    if (!editingCategory) {
      return categoriesData.categories;
    }

    // Filter out the category being edited and its children
    const filterCategory = (category: any): boolean => {
      if (category.id === editingCategory.id) return false;
      if (category.parentCategoryId === editingCategory.id) return false;
      return true;
    };

    return categoriesData.categories.filter(filterCategory);
  };

  const getCategoryLevel = (category: any): number => {
    if (!category.parentCategoryId) return 0;
    const parent = categoriesData?.categories?.find(
      (c) => c.id === category.parentCategoryId
    );
    return parent ? getCategoryLevel(parent) + 1 : 0;
  };

  const renderCategoryTree = (categories: any[], level = 0) => {
    const rootCategories = categories.filter((c) => !c.parentCategoryId);
    const childCategories = categories.filter((c) => c.parentCategoryId);

    const renderCategory = (category: any, level: number) => {
      const children = childCategories.filter(
        (c) => c.parentCategoryId === category.id
      );

      return (
        <div key={category.id}>
          <div
            className="flex items-center justify-between p-3 border-b hover:bg-gray-50"
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            <div className="flex items-center space-x-3">
              {children.length > 0 ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-gray-400" />
              )}
              <div>
                <div className="font-medium text-gray-900">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-gray-500">
                    {category.description}
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="ml-2">
                {category.productCount} products
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditModal(category)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeletingCategory(category)}
                  className="text-red-600"
                  disabled={category.productCount > 0 || children.length > 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {children.map((child) => renderCategory(child, level + 1))}
        </div>
      );
    };

    return rootCategories.map((category) => renderCategory(category, level));
  };

  if (isLoading) {
    return <LoadingScreen message="Loading categories..." />;
  }

  if (error) {
    return (
      <PageWrapper title="Categories" description="Organize your products">
        <ErrorMessage
          title="Failed to load categories"
          message="There was an error loading your categories. Please try again."
          onRetry={() => refetch()}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Categories"
      description="Organize your products with categories"
      action={
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      }
    >
      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesData?.totalCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">categories created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Root Categories
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesData?.categories?.filter((c) => !c.parentCategoryId)
                .length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              top-level categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Products Categorized
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoriesData?.categories?.reduce(
                (sum, cat) => sum + cat.productCount,
                0
              ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              total product assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Category Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {!categoriesData?.categories ||
          categoriesData.categories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first product category
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Category
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              {renderCategoryTree(categoriesData.categories)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Category Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category information below."
                : "Create a new category to organize your products."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter category name"
                autoFocus
              />
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
                placeholder="Optional category description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentCategory">Parent Category</Label>
              <Select
                value={formData.parentCategoryId || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentCategoryId: value === "none" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    No Parent (Root Category)
                  </SelectItem>
                  {getAvailableParentCategories().map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.parentCategoryId && "└ "}
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Leave empty to create a top-level category
              </p>
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
                createCategoryMutation.isPending ||
                updateCategoryMutation.isPending ||
                !formData.name.trim()
              }
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"?
              {deletingCategory?.productCount > 0 && (
                <span className="text-red-600 block mt-2">
                  This category contains {deletingCategory.productCount}{" "}
                  products and cannot be deleted.
                </span>
              )}
              {deletingCategory?.subCategories?.length > 0 && (
                <span className="text-red-600 block mt-2">
                  This category has subcategories and cannot be deleted.
                </span>
              )}
              {deletingCategory?.productCount === 0 &&
                deletingCategory?.subCategories?.length === 0 && (
                  <span className="block mt-2">
                    This action cannot be undone.
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteCategoryMutation.isPending ||
                deletingCategory?.productCount > 0 ||
                deletingCategory?.subCategories?.length > 0
              }
            >
              {deletingCategory?.productCount > 0 ||
              deletingCategory?.subCategories?.length > 0
                ? "Cannot Delete"
                : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
