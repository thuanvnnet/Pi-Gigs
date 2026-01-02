// lib/schemas.ts
import { z } from "zod";

export const gigSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(80),
  categoryId: z.string().min(1, "Please select a category"),
  description: z.string().min(100, "Description must be at least 100 characters"),
  basePricePi: z.number().min(1, "Price must be at least 1 Pi"),
  deliveryDays: z.number().min(1, "Delivery days must be at least 1"),
  images: z.array(z.string()).min(1, "At least 1 image is required").max(5),
});

export type GigFormValues = z.infer<typeof gigSchema>;