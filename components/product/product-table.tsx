"use client";

import { Button } from "@/components/ui/button";
import { Package, Edit, Trash2 } from "lucide-react";
import { ProductListResponse } from "@/types/product";
import Image from "next/image";

interface ProductTableProps {
  products: ProductListResponse[];
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function ProductTable({ products, onDelete, onEdit }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead className="bg-muted border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[200px]">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider max-w-[300px]">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[80px]">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[120px]">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-accent transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Image src={product.image} alt={product.name} width={56} height={56} className="object-cover h-14 w-14 rounded flex-shrink-0" />
                  <div className="text-sm font-medium text-foreground truncate min-w-0">{product.name}</div>
                </div>
              </td>
              <td className="px-4 py-4 max-w-[300px]">
                <div className="text-sm text-foreground line-clamp-2 break-words">{product.description}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-foreground">₱{product.price.toFixed(2)}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-foreground">{product.stock}</div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-foreground truncate">
                  {product.category?.name || "No Category"}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div
                  className={`text-sm rounded-md text-center px-2 py-1 ${
                    product.isActive
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(product.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
