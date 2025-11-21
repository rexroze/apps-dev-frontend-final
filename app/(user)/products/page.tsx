"use client";

import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LogOut } from "lucide-react";
import Image from "next/image";

// Static products data for demo
const staticProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    image: "/next.svg",
    status: "active",
    stock: 50,
    category: "Electronics",
  },
  {
    id: "2",
    name: "Smart Watch",
    description: "Feature-rich smartwatch with health tracking",
    price: 299.99,
    image: "/next.svg",
    status: "active",
    stock: 30,
    category: "Electronics",
  },
  {
    id: "3",
    name: "Laptop Stand",
    description: "Ergonomic laptop stand for better posture",
    price: 49.99,
    image: "/next.svg",
    status: "active",
    stock: 100,
    category: "Accessories",
  },
  {
    id: "4",
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches",
    price: 129.99,
    image: "/next.svg",
    status: "active",
    stock: 25,
    category: "Accessories",
  },
];

export default function ProductsPage() {
  const { user, logout } = useAuth();

  // Filter only active products
  const activeProducts = staticProducts.filter((p) => p.status === "active");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">Browse our active products</p>
        </div>

        {activeProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No active products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                    {product.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                    <Button size="sm" disabled={product.stock === 0}>
                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  );
}