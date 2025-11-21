"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import { hardDeleteProductService } from "@/services/product";
import { ProductListResponse } from "@/types/product";
import { toast } from "sonner";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";

interface DeleteProductModalProps {
  product: ProductListResponse | null;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteProductModal({
  product,
  userId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!product) return;

    try {
      setIsDeleting(true);
      const response = await hardDeleteProductService({
        id: product.id,
        userId,
      });

      if (response.status === "success") {
        toast.success("Product deleted successfully");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: unknown) {
      toast.error(apiErrorHandler(error as AxiosError).message ?? "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to delete this product? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {product && (
          <div className="py-4">
            <p className="text-sm text-gray-600">
              You are about to delete <span className="font-semibold text-gray-900">{product.name}</span>. This will permanently remove the product from the system.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

