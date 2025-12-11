"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Settings, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { UserMenu } from "@/components/ui/user-menu";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({ name: "", slug: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/category/v1/categories");
      if (response.data.status === "success") {
        setCategories(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch categories");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await api.post("/api/category/v1/categories", {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
      });

      if (response.data.status === "success") {
        toast.success("Category created successfully");
        setIsCreateModalOpen(false);
        setFormData({ name: "", slug: "" });
        fetchCategories();
      } else {
        toast.error(response.data.message || "Failed to create category");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug || "" });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await api.put(`/api/category/v1/categories/${editingCategory.id}`, {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
      });

      if (response.data.status === "success") {
        toast.success("Category updated successfully");
        setIsEditModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", slug: "" });
        fetchCategories();
      } else {
        toast.error(response.data.message || "Failed to update category");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      const response = await api.delete(`/api/category/v1/categories/${deletingCategory.id}`);

      if (response.data.status === "success") {
        toast.success("Category deleted successfully");
        setDeleteConfirmOpen(false);
        setDeletingCategory(null);
        fetchCategories();
      } else {
        toast.error(response.data.message || "Failed to delete category");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-green-900 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link 
                  href="/admin/products"
                  className="p-1.5 rounded-md hover:bg-green-800 transition-all duration-200 group cursor-pointer"
                  aria-label="Go to admin products"
                >
                  <Settings className="w-6 h-6 text-secondary group-hover:text-yellow-400 group-hover:rotate-90 transition-all duration-200" />
                </Link>
                <Link href="/store" className="text-2xl font-bold text-yellow-500 hover:text-yellow-400 transition-colors">
                  TechCraftersHQ
                </Link>
                <span className="text-white">/</span>
                <h1 className="text-2xl font-bold text-yellow-500">Category Management</h1>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/admin/products">
                  <Button variant="outline" size="sm">Products</Button>
                </Link>
                <Link href="/admin/sales">
                  <Button variant="outline" size="sm">Sales</Button>
                </Link>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="w-8 h-8" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchCategories} className="ml-auto">
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="mr-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Create Category</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="category-slug"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleCreate} className="flex-1">Create</Button>
                <Button variant="outline" onClick={() => {
                  setIsCreateModalOpen(false);
                  setFormData({ name: "", slug: "" });
                }} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="category-slug"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleUpdate} className="flex-1">Update</Button>
                <Button variant="outline" onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategory(null);
                  setFormData({ name: "", slug: "" });
                }} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && deletingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Category</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deletingCategory.name}"? This action cannot be undone.
                If this category has products, deletion will be prevented.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setDeletingCategory(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

