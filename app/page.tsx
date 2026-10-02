import React from 'react';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { BannerSlider } from '@/components/storefront/BannerSlider';
import { Hero3D } from '@/components/storefront/Hero3D';
import { ProductCard } from '@/components/storefront/ProductCard';
import { WhatsAppCallout } from '@/components/storefront/WhatsAppCallout';
import { SAMPLE_DESIGNS, SAMPLE_CATEGORIES } from '@/lib/data/sample-designs';
import { Banner, ContentBlock, HomeSection, SiteSettings } from '@/types/database';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

// Point 2: Scheduled banners go live/expire within ~60s via Next.js ISR
export const revalidate = 60;

export default async function HomePage() {
  const nowIso = new Date().toISOString();

  // Parallel fetch of all homepage content
  let sections: HomeSection[] = [];
  let banners: Banner[] = [];
  let settings: Partial<SiteSettings> = {};
  let designs: any[] = [];
  let categories: any[] = [];
  let contentBlocks: ContentBlock[] = [];

  try {
    const [
      sectionsRes,
      bannersRes,
      settingsRes,
      designsRes,
      categoriesRes,
      blocksRes,
    ] = await Promise.all([
      supabaseAdmin
        .from('home_sections')
        .select('*')
        .eq('enabled', true)
        .order('sort_order', { ascending: true }),

      supabaseAdmin
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),

      supabaseAdmin
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .single(),

      supabaseAdmin
        .from('designs')
        .select('*, categories(name, slug)')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),

      supabaseAdmin
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true }),

      supabaseAdmin
        .from('content_blocks')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (sectionsRes.data && sectionsRes.data.length > 0) {
      sections = sectionsRes.data;
    }
    if (bannersRes.data) {
      // Point 2: Filter active by schedule (start_at <= now and end_at >= now)
      banners = bannersRes.data.filter((b) => {
        if (b.start_at && new Date(b.start_at) > new Date(nowIso)) return false;
        if (b.end_at && new Date(b.end_at) < new Date(nowIso)) return false;
        return true;
      });
    }
    if (settingsRes.data) {
      settings = settingsRes.data;
    }
    if (designsRes.data && designsRes.data.length > 0) {
      designs = designsRes.data;
    } else {
      designs = SAMPLE_DESIGNS;
    }
    if (categoriesRes.data && categoriesRes.data.length > 0) {
      categories = categoriesRes.data;
    } else {
      categories = SAMPLE_CATEGORIES;
    }
    if (blocksRes.data) {
      contentBlocks = blocksRes.data;
    }
  } catch (e) {
    console.warn('Error fetching homepage data, falling back to defaults:', e);
    designs = SAMPLE_DESIGNS;
    categories = SAMPLE_CATEGORIES;
  }

  // Fallback default sections if home_sections table is empty
  if (sections.length === 0) {
    sections = [
      { id: '1', key: 'banner_slider', title: 'Featured', subtitle: '', enabled: true, sort_order: 1, config: {}, created_at: '', updated_at: '' },
      { id: '2', key: 'hero_3d', title: 'Visualizer', subtitle: '', enabled: true, sort_order: 2, config: {}, created_at: '', updated_at: '' },
      { id: '3', key: 'categories', title: 'Collections', subtitle: '', enabled: true, sort_order: 3, config: {}, created_at: '', updated_at: '' },
      { id: '4', key: 'featured', title: 'Featured Drops', subtitle: '', enabled: true, sort_order: 4, config: {}, created_at: '', updated_at: '' },
      { id: '5', key: 'how_it_works', title: 'How It Works', subtitle: '', enabled: true, sort_order: 5, config: {}, created_at: '', updated_at: '' },
      { id: '6', key: 'why_revntrix', title: 'Why Revntrix', subtitle: '', enabled: true, sort_order: 6, config: {}, created_at: '', updated_at: '' },
      { id: '7', key: 'faq', title: 'FAQ', subtitle: '', enabled: true, sort_order: 7, config: {}, created_at: '', updated_at: '' },
      { id: '8', key: 'custom_callout', title: 'Custom Print', subtitle: '', enabled: true, sort_order: 8, config: {}, created_at: '', updated_at: '' },
    ];
  }

  // Point 9: Build slug maps to dynamically resolve design IDs and category IDs
  const designSlugMap: Record<string, string> = {};
  designs.forEach((d) => {
    if (d.id && d.slug) designSlugMap[d.id] = d.slug;
  });

  const categorySlugMap: Record<string, string> = {};
  categories.forEach((c) => {
    if (c.id && c.slug) categorySlugMap[c.id] = c.slug;
  });

  // Group content blocks
  const howItWorksBlocks = contentBlocks.filter((b) => b.type === 'how_it_works');
  const whyRevntrixBlocks = contentBlocks.filter((b) => b.type === 'why_revntrix');
  const faqBlocks = contentBlocks.filter((b) => b.type === 'faq');
  const reviewBlocks = contentBlocks.filter((b) => b.type === 'review');

  const featuredDesigns = designs.filter((d) => d.is_featured).slice(0, 8);
  const newDropDesigns = designs.filter((d) => d.is_new_drop).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0A0A0A]">
      <Header
        initialSettings={settings}
        announcement={settings.announcement_bar}
      />

      <main className="flex-1">
        {/* Render sections strictly according to home_sections table */}
        {sections.map((section) => {
          switch (section.key) {
            case 'banner_slider':
              // Point 4: If banner_slider is enabled but there are 0 live banners, render nothing (no gap)
              if (banners.length === 0) return null;
              return (
                <BannerSlider
                  key={section.id}
                  banners={banners}
                  autoplayIntervalMs={settings.banner_autoplay_ms ?? 5000}
                  autoplayEnabled={settings.banner_autoplay_enabled ?? true}
                  transition={(settings.banner_transition as any) ?? 'fade'}
                  designSlugMap={designSlugMap}
                  categorySlugMap={categorySlugMap}
                />
              );

            case 'hero_3d':
              return (
                <Hero3D
                  key={section.id}
                  title={section.title || 'PRINTED TO ORDER.\nORDER ON WHATSAPP.'}
                  subtitle={section.subtitle || 'Streetwear Visualizer'}
                  description={settings.description || 'Printed to order, delivered across India.'}
                  whatsappEnabled={settings.whatsapp_enabled !== false}
                />
              );

            case 'categories':
              return (
                <section key={section.id} className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                        {section.subtitle || 'Collections'}
                      </span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-950">
                        {section.title || 'Explore Aesthetic Disciplines'}
                      </h2>
                    </div>
                    <Link
                      href="/shop"
                      className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1"
                    >
                      View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat, idx) => (
                      <Link
                        key={cat.id || idx}
                        href={`/shop?category=${cat.slug}`}
                        className="group relative p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-900 transition-all duration-300 hover:shadow-md flex flex-col justify-between min-h-[160px]"
                      >
                        <div>
                          <span className="font-mono text-[10px] text-zinc-400 font-bold block mb-2">
                            0{idx + 1}
                          </span>
                          <h3 className="font-display font-bold text-base text-zinc-900 group-hover:text-black">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                            {cat.description}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-zinc-900 group-hover:translate-x-1 transition-transform">
                          Explore Drops <span>→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );

            case 'featured':
              return (
                <section key={section.id} className="py-16 md:py-20 bg-zinc-50/60 border-y border-zinc-100">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                          {section.subtitle || 'Limited Drops'}
                        </span>
                        <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-950">
                          {section.title || 'Featured Streetwear T-Shirts'}
                        </h2>
                      </div>
                      <Link
                        href="/shop"
                        className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1"
                      >
                        Shop All Drops ({designs.length}) <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {featuredDesigns.map((design) => (
                        <ProductCard
                          key={design.id}
                          design={{
                            ...design,
                            category_name: design.categories?.name,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'new_drops':
              if (newDropDesigns.length === 0) return null;
              return (
                <section key={section.id} className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                        {section.subtitle || 'Fresh Releases'}
                      </span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-950">
                        {section.title || 'Latest Drops'}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {newDropDesigns.map((design) => (
                      <ProductCard
                        key={design.id}
                        design={{
                          ...design,
                          category_name: design.categories?.name,
                        }}
                      />
                    ))}
                  </div>
                </section>
              );

            case 'how_it_works':
              return (
                <section key={section.id} className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 border-b border-zinc-100">
                  <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                      {section.subtitle || 'Zero Clutter Ordering'}
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-950">
                      {section.title || 'How Print-on-Demand on WhatsApp Works'}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-2">
                      No account creation, no carts, no complicated checkout forms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(howItWorksBlocks.length > 0 ? howItWorksBlocks : [
                      { id: '1', title: '01. Choose Design', content: 'Browse our curated drops and view artworks on the real 3D t-shirt canvas.' },
                      { id: '2', title: '02. Pick Color & Fit', content: 'Test colorways in 3D and pick your size from S up to XXL using our fit guide.' },
                      { id: '3', title: '03. Order on WhatsApp', content: 'Your order specs and unique ref code prefill instantly on WhatsApp.' },
                      { id: '4', title: '04. Printed & Delivered', content: 'Confirm payment on WhatsApp; our printer prepares and dispatches to your doorstep.' },
                    ]).map((block: any, i: number) => (
                      <div key={block.id || i} className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm relative">
                        <span className="font-display font-black text-3xl text-zinc-200 block mb-2">
                          0{i + 1}
                        </span>
                        <h3 className="font-bold text-sm text-zinc-900 mb-1">{block.title}</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">{block.content}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'why_revntrix':
              // Point 3: Neutral Why Revntrix points only
              return (
                <section key={section.id} className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                      {section.subtitle || 'The REVNTRIX Standard'}
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-950">
                      {section.title || 'Why Order with REVNTRIX'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(whyRevntrixBlocks.length > 0 ? whyRevntrixBlocks : [
                      { id: '1', title: 'Printed to order', subtitle: 'Zero deadstock', content: 'Each item is printed upon confirmation, avoiding overproduction.' },
                      { id: '2', title: 'Delivered across India', subtitle: 'Tracked courier', content: 'Courier delivery available across all service PIN codes in India.' },
                      { id: '3', title: 'Order easily on WhatsApp', subtitle: 'Direct concierge', content: 'No complicated cart or login forms. Chat with our team directly.' },
                    ]).map((item: any, idx: number) => (
                      <div key={item.id || idx} className="p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm mb-4">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="font-display font-bold text-lg text-zinc-900">{item.title}</h3>
                        {item.subtitle && <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{item.subtitle}</p>}
                        <p className="text-xs text-zinc-600 leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'testimonials':
              // Hide completely if no review blocks exist (Point 3)
              if (reviewBlocks.length === 0) return null;
              return (
                <section key={section.id} className="py-16 bg-zinc-50 border-t border-zinc-100">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                        {section.subtitle || 'Community'}
                      </span>
                      <h2 className="font-display font-black text-2xl text-zinc-950">
                        {section.title || 'Customer Feedback'}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {reviewBlocks.map((r) => (
                        <div key={r.id} className="p-6 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                          <p className="text-xs text-zinc-700 italic mb-4">&quot;{r.content}&quot;</p>
                          <div className="text-xs font-bold text-zinc-900">{r.title}</div>
                          {r.subtitle && <div className="text-[11px] text-zinc-400">{r.subtitle}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faq':
              return (
                <section key={section.id} className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6">
                  <div className="text-center mb-12">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                      {section.subtitle || 'Help Center'}
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-950">
                      {section.title || 'Frequently Asked Questions'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {(faqBlocks.length > 0 ? faqBlocks : [
                      { id: '1', title: 'How do I place an order?', content: 'Select your t-shirt design, size, and colorway, then tap "Order on WhatsApp". Your order details will be prefilled in a WhatsApp chat where we confirm payment via UPI.' },
                      { id: '2', title: 'What payment methods do you accept?', content: 'We accept direct UPI transfers (Google Pay, PhonePe, Paytm, BHIM) securely in WhatsApp.' },
                      { id: '3', title: 'How long does production and shipping take?', content: 'Each shirt is custom printed to order upon confirmation and dispatched across India via tracked courier.' },
                    ]).map((faq: any, i: number) => (
                      <div key={faq.id || i} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                        <h3 className="font-bold text-sm text-zinc-900">{faq.title}</h3>
                        <p className="text-xs text-zinc-600 leading-relaxed">{faq.content}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'custom_callout':
              return (
                <WhatsAppCallout
                  key={section.id}
                  title={section.title || 'HAVE A CUSTOM PRINT REQUEST?'}
                  subtitle={section.subtitle || 'We collaborate with streetwear creators, artists, and collegiate squads. Reach out directly on WhatsApp to discuss bulk orders.'}
                />
              );

            default:
              return null;
          }
        })}
      </main>

      <Footer
        initialSettings={settings}
      />
    </div>
  );
}
