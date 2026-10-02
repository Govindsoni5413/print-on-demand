import { z } from 'zod';

export const SafeLinkTargetSchema = z.string().superRefine((val, ctx) => {
  if (!val || val.trim() === '') return;
  const trimmed = val.trim();
  // Safe relative paths starting with /
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Protocol-relative URLs are not permitted.',
      });
    }
    return;
  }
  // Safe external URLs starting with https://
  if (trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid https URL.',
      });
      return;
    }
  }
  // Disallow javascript:, data:, http:, etc.
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: 'Link must be a relative path starting with "/" or an external "https://" URL.',
  });
});

export const BannerSchema = z.object({
  title: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  cta_text: z.string().optional().default(''),
  link_type: z.enum(['shop', 'category', 'design', 'custom', 'whatsapp']),
  link_target: z.string().default(''),
  desktop_image_url: z.string().min(1, 'Desktop image is required'),
  mobile_image_url: z.string().optional().nullable(),
  text_mode: z.enum(['overlay', 'image_only']).default('overlay'),
  text_align: z.enum(['left', 'center', 'right']).default('left'),
  text_color: z.enum(['light', 'dark']).default('light'),
  overlay_opacity: z.number().min(0).max(100).default(30),
  start_at: z.string().optional().nullable(),
  end_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
}).superRefine((data, ctx) => {
  if (data.link_type === 'custom' && data.link_target) {
    const parse = SafeLinkTargetSchema.safeParse(data.link_target);
    if (!parse.success) {
      ctx.addIssue({
        path: ['link_target'],
        code: z.ZodIssueCode.custom,
        message: 'Custom link must be a relative path starting with "/" or a secure "https://" URL.',
      });
    }
  }
  if (data.start_at && data.end_at) {
    if (new Date(data.start_at) > new Date(data.end_at)) {
      ctx.addIssue({
        path: ['end_at'],
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date.',
      });
    }
  }
});

export const PageSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens (e.g. shipping-and-returns)'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
});

export const MenuItemSchema = z.object({
  location: z.enum(['header', 'footer']),
  label: z.string().min(1, 'Label is required'),
  url: SafeLinkTargetSchema,
  sort_order: z.number().default(0),
  is_active: z.boolean().default(true),
  open_in_new_tab: z.boolean().default(false),
});

export const ContentBlockSchema = z.object({
  type: z.enum(['how_it_works', 'why_revntrix', 'faq', 'review']),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  icon_name: z.string().optional().nullable(),
  sort_order: z.number().default(0),
  is_active: z.boolean().default(true),
});

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

export function validateImageUpload(file: { size: number; type: string }) {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum allowed 5MB limit.' };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file format. Allowed formats: JPEG, PNG, WebP, SVG, GIF.' };
  }
  return { valid: true };
}
