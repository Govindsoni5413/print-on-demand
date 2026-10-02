import { z } from "zod";

export const CreateLeadSchema = z.object({
  sessionId: z.string().min(5).max(100),
  designId: z.string().uuid().nullable().optional(),
  size: z.enum(["S", "M", "L", "XL", "XXL"]).nullable().optional(),
  color: z.string().max(50).nullable().optional(),
  source: z.enum(["product_page", "floating_button", "hero_cta", "direct"]).default("product_page"),
  designTitle: z.string().max(200).optional(),
  price: z.number().nonnegative().optional(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadStatusSchema = z.object({
  status: z.enum([
    "new",
    "contacted",
    "confirmed",
    "paid",
    "printing",
    "shipped",
    "delivered",
    "cancelled",
    "spam",
  ]),
  customerName: z.string().max(100).optional(),
  customerPhone: z.string().max(30).optional(),
  shippingAddress: z.string().max(500).optional(),
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  printerNotes: z.string().max(500).optional(),
});

export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;
