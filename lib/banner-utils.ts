import { Banner } from '@/types/database';

export function resolveBannerUrl(
  banner: Banner,
  designSlugMap: Record<string, string> = {},
  categorySlugMap: Record<string, string> = {}
): string {
  switch (banner.link_type) {
    case 'shop':
      return '/shop';

    case 'category': {
      const target = banner.link_target || '';
      const slug = (target && categorySlugMap[target]) ? categorySlugMap[target] : target;
      return slug ? `/shop?category=${encodeURIComponent(slug)}` : '/shop';
    }

    case 'design': {
      const target = banner.link_target || '';
      const slug = (target && designSlugMap[target]) ? designSlugMap[target] : target;
      return slug ? `/product/${encodeURIComponent(slug)}` : '/shop';
    }

    case 'whatsapp':
      return banner.link_target || '#whatsapp';

    case 'custom': {
      const url = banner.link_target?.trim();
      if (!url) return '/shop';
      // Safety: Only permit relative paths starting with / (excluding //) or external https://
      if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
      }
      if (url.startsWith('https://')) {
        return url;
      }
      // Reject javascript:, data:, http:, etc.
      return '/shop';
    }

    default:
      return '/shop';
  }
}
