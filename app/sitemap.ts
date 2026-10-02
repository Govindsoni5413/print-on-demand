import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SAMPLE_DESIGNS } from '@/lib/data/sample-designs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Static Storefront Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping-and-returns`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Dynamic Published Product Routes
  try {
    const { data: designs } = await supabaseAdmin
      .from('designs')
      .select('slug, updated_at')
      .eq('status', 'published');

    const publishedSlugs = (designs && designs.length > 0)
      ? designs
      : SAMPLE_DESIGNS.map(d => ({ slug: d.slug, updated_at: new Date().toISOString() }));

    const productRoutes: MetadataRoute.Sitemap = publishedSlugs.map((item) => ({
      url: `${baseUrl}/product/${item.slug}`,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.warn('Failed to query database for sitemap, using sample designs:', error);
    const fallbackRoutes: MetadataRoute.Sitemap = SAMPLE_DESIGNS.map((item) => ({
      url: `${baseUrl}/product/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    return [...staticRoutes, ...fallbackRoutes];
  }
}
