"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductTable } from "./product-table";
import { AddProductModal } from "./add-product-modal";
import { UpdateProductModal } from "./update-product-modal";
import { DeleteProductModal } from "./delete-product-modal";
import { ProductListResponse } from "@/types/product";
import { AdminLayout } from "@/components/admin/admin-layout";

export function AdminProductsPage() {
  const { user } = useAuth();
  const { products, isLoading, isError, error, mutate } = useProducts(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingProduct, setEditingProduct] = useState<ProductListResponse | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductListResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = product.isActive === true;
    } else if (statusFilter === "inactive") {
      matchesStatus = product.isActive === false;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setDeletingProduct(product);
      setIsDeleteModalOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setEditingProduct(product);
      setIsUpdateModalOpen(true);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout title="Product Management">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Spinner className="w-8 h-8" />
                <p className="text-sm text-gray-600">Loading products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">
                  {error?.message || "Failed to fetch products"}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => mutate()}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          {!isLoading && (
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:max-w-xs"
                />
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
                >
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-auto">
                <AddProductModal
                  userId={user?.id || ""}
                  onSuccess={() => mutate()}
                />
              </div>
            </div>
          )}

          {/* Products Table */}
          {!isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <ProductTable
                products={filteredProducts}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          )}

          {/* Update Product Modal */}
          <UpdateProductModal
            product={editingProduct}
            userId={user?.id || ""}
            open={isUpdateModalOpen}
            onOpenChange={setIsUpdateModalOpen}
            onSuccess={() => {
              mutate();
              setEditingProduct(null);
            }}
          />

          {/* Delete Product Modal */}
          <DeleteProductModal
            product={deletingProduct}
            userId={user?.id || ""}
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            onSuccess={() => {
              mutate();
              setDeletingProduct(null);
            }}
          />

          {/* Summary */}
          {!isLoading && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Total Products</div>
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Active Products</div>
                <div className="text-2xl font-bold text-green-600">
                  {products.filter((product) => product.isActive).length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600">Total Stock</div>
                <div className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, product) => sum + product.stock, 0)}
                </div>
              </div>
            </div>
          )}
      </AdminLayout>
    </ProtectedRoute>
  );
}