"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import { createProductValidator, CreateProductSchema } from "./schemas/validators";
import { createProductService } from "@/services/product";
import { toast } from "sonner";
import { apiErrorHandler } from "@/lib/axios";
import { AxiosError } from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/axios";

interface AddProductModalProps {
  userId: string;
  onSuccess?: () => void;
}

export function AddProductModal({ userId, onSuccess }: AddProductModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductValidator),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvRcHRFoxR9VoZGcStde7VBG9S8ndG7TVQlQ&s",
      categoryId: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      api.get("/api/category/v1/categories")
        .then((res) => {
          if (res?.data?.status === "success" && Array.isArray(res.data.data)) {
            setCategories(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  async function onSubmit(values: CreateProductSchema) {
    try {
      setIsSubmitting(true);
      const response = await createProductService({
        userId,
        ...values,
      });

      if (response.status === "success") {
        toast.success("Product created successfully");
        form.reset();
        setOpen(false);
        onSuccess?.();
      }
    } catch (error: unknown) {
      toast.error(apiErrorHandler(error as AxiosError).message ?? "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new product.
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image (URL or Upload)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input 
                        placeholder="https://via.placeholder.com/400" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear file input if URL is entered
                          const fileInput = document.getElementById('image-upload-add') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">OR</span>
                        <Input
                          id="image-upload-add"
                          type="file"
                          accept="image/*"
                          className="text-sm"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                field.onChange(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      {field.value && (
                        <div className="mt-2">
                          <img src={field.value} alt="Preview" className="w-32 h-32 object-contain border rounded" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
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
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
