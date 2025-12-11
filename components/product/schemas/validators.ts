import { z } from "zod";

export const createProductValidator = z.object({
  name: z.string().min(1, {
    message: "Product name is required.",
  }),
  description: z.string().min(1, {
    message: "Product description is required.",
  }),
  price: z.number().min(0.01, {
    message: "Price must be greater than 0.",
  }),
  stock: z.number().int().min(0, {
    message: "Stock must be a non-negative integer.",
  }),
  image: z.string().min(1, {
    message: "Image URL is required.",
  }),
  categoryId: z.string().optional(),
});

export type CreateProductSchema = z.infer<typeof createProductValidator>;

