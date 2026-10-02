import { z } from "zod";

export const ColorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be valid hex color"),
  inStock: z.boolean().default(true),
});

export const DesignFormSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).optional().default(""),
  category_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([]),
  price: z.coerce.number().positive("Price must be greater than 0"),
  mrp: z.coerce.number().positive("MRP must be greater than 0"),
  colors: z.array(ColorSchema).min(1, "At least one color is required"),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  design_image_url: z.string().min(1, "Design PNG is required"),
  placement: z.enum(["chest", "center", "back"]).default("chest"),
  design_scale: z.coerce.number().min(0.2).max(3.0).default(1.0),
  status: z.enum(["draft", "published"]).default("draft"),
  is_featured: z.boolean().default(false),
  is_new_drop: z.boolean().default(false),
  is_sold_out: z.boolean().default(false),
  sort_order: z.coerce.number().default(0),
});

export type DesignFormData = z.infer<typeof DesignFormSchema>;
