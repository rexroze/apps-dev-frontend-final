"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProductValidator, CreateProductSchema } from "./schemas/validators";
import { updateProductService, softDeleteProductService, restoreProductService } from "@/services/product";
import { ProductListResponse } from "@/types/product";
import { toast } from "sonner";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";

interface UpdateProductModalProps {
  product: ProductListResponse | null;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpdateProductModal({
  product,
  userId,
  open,
  onOpenChange,
  onSuccess,
}: UpdateProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<boolean>(true);

  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductValidator),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvRcHRFoxR9VoZGcStde7VBG9S8ndG7TVQlQ&s",
    },
  });

  // Update form and status when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
      });
      setStatus(product.isActive);
    }
  }, [product, form]);

  async function onSubmit(values: CreateProductSchema) {
    if (!product) return;

    try {
      setIsSubmitting(true);
      
      // Update product details
      const updateResponse = await updateProductService({
        id: product.id,
        userId,
        ...values,
      });

      if (updateResponse.status === "success") {
        // Handle status change if it's different
        const statusChanged = status !== product.isActive;
        if (statusChanged) {
          if (status) {
            // Restore product (make active)
            await restoreProductService({
              id: product.id,
              userId,
            });
          } else {
            // Soft delete product (make inactive)
            await softDeleteProductService({
              id: product.id,
              userId,
            });
          }
        }

        toast.success("Product updated successfully");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: unknown) {
      toast.error(apiErrorHandler(error as AxiosError).message ?? "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
          <DialogDescription>
            Update the product details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvRcHRFoxR9VoZGcStde7VBG9S8ndG7TVQlQ&s" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                value={status ? "active" : "inactive"}
                onValueChange={(value) => setStatus(value === "active")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

