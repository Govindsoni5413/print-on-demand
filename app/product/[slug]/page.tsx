'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { TshirtCanvas } from '@/components/3d/TshirtCanvas';
import { SizeGuideModal } from '@/components/storefront/SizeGuideModal';
import { handleWhatsAppRedirect } from '@/lib/whatsapp';
import { SAMPLE_DESIGNS } from '@/lib/data/sample-designs';
import { createClient } from '@/lib/supabase/client';
import { formatINR, getSessionId } from '@/lib/utils';
import {
  MessageCircle,
  Ruler,
  Truck,
  Sparkles,
  Check,
  ChevronRight,
  ShieldCheck,
  Rotate3D,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('#121212');
  const [selectedColorName, setSelectedColorName] = useState<string>('Onyx Black');
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [designRes, settingsRes] = await Promise.all([
          supabase
            .from('designs')
            .select('*, categories(name, slug)')
            .eq('slug', slug)
            .single(),
          supabase
            .from('site_settings')
            .select('shipping_info')
            .eq('id', 'default')
            .single(),
        ]);

        if (settingsRes.data?.shipping_info) {
          setShippingInfo(settingsRes.data.shipping_info);
        }

        const data = designRes.data;
        const error = designRes.error;

        if (data && !error) {
          setDesign(data);
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0].hex);
            setSelectedColorName(data.colors[0].name);
          }
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }
        } else {
          // Fallback to sample design if DB row not found
          const sample = SAMPLE_DESIGNS.find((d) => d.slug === slug) || SAMPLE_DESIGNS[0];
          setDesign(sample);
          if (sample.colors && sample.colors.length > 0) {
            setSelectedColor(sample.colors[0].hex);
            setSelectedColorName(sample.colors[0].name);
          }
          if (sample.sizes && sample.sizes.length > 0) {
            setSelectedSize(sample.sizes[0]);
          }
        }
      } catch (err) {
        console.warn('Fallback to sample design:', err);
        const sample = SAMPLE_DESIGNS.find((d) => d.slug === slug) || SAMPLE_DESIGNS[0];
        setDesign(sample);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Log product view event
  useEffect(() => {
    if (design?.id) {
      const sessionId = getSessionId();
      fetch('/api/track/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'product_view',
          sessionId,
          designId: design.id,
          path: `/product/${design.slug}`,
          metadata: { title: design.title, price: design.price },
        }),
      }).catch(() => {});
    }
  }, [design?.id]);

  if (loading || !design) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercent = Math.round(((design.mrp - design.price) / design.mrp) * 100);

  // Point 3 & 4 WhatsApp Click Handler
  const handleOrderClick = async () => {
    if (isOrdering) return;
    setIsOrdering(true);

    toast.info('Connecting to WhatsApp concierge...');

    try {
      await handleWhatsAppRedirect({
        designId: design.id,
        designTitle: design.title,
        size: selectedSize,
        color: selectedColorName,
        price: design.price,
        source: 'product_page',
      });
    } finally {
      setTimeout(() => setIsOrdering(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0A0A0A]">
      <Header />

      {/* JSON-LD Product Schema for SEO (Point 8) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: design.title,
            image: design.design_image_url,
            description: design.description || 'Premium cotton streetwear tee. Printed to order, delivered across India.',
            brand: {
              '@type': 'Brand',
              name: 'REVNTRIX',
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: design.price,
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/shop" className="hover:text-black">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-semibold truncate max-w-xs">{design.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: 3D Canvas Visualizer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#0F0F12] rounded-3xl overflow-hidden border border-zinc-200/80 shadow-inner flex items-center justify-center">
              {/* 3D Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-semibold border border-white/10">
                <Rotate3D className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>3D Interactive • Drag to Rotate</span>
              </div>

              {/* 3D Canvas */}
              <TshirtCanvas
                color={selectedColor}
                designImageUrl={design.design_image_url}
                placement={design.placement || 'chest'}
                scale={design.design_scale || 1.0}
                interactive={true}
                autoRotate={false}
                className="w-full h-full"
              />

              {/* Reset view hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[10px] text-zinc-400 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                360° View Enabled
              </div>
            </div>

            {/* Artwork Graphic Reference */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-950 rounded-xl p-2 flex items-center justify-center border border-zinc-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={design.design_image_url}
                  alt={design.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="text-xs">
                <span className="font-bold text-zinc-900 block">Artwork Details</span>
                <span className="text-zinc-500">
                  Placement: <span className="capitalize font-semibold text-zinc-700">{design.placement || 'Chest'}</span> • High-opacity screen print
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Specifications & WhatsApp Order CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {design.categories?.name && (
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                  {design.categories.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-zinc-900">
                {design.title}
              </h1>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-3xl font-black font-display text-zinc-950">
                  {formatINR(design.price)}
                </span>
                {design.mrp > design.price && (
                  <>
                    <span className="text-base text-zinc-400 line-through">
                      {formatINR(design.mrp)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 block mt-1">
                Inclusive of all taxes. Printed to order.
              </span>
            </div>

            {/* Description (Neutral copy per Point 9) */}
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {design.description ||
                'Premium cotton tees. Printed to order, delivered across India. Features custom screenprinted graphic on durable combed cotton fabric.'}
            </p>

            {/* Color Swatches */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-zinc-800">
                  Color:{' '}
                  <span className="font-semibold text-zinc-500">{selectedColorName}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {design.colors?.map((col: any) => {
                  const isSelected = selectedColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => {
                        setSelectedColor(col.hex);
                        setSelectedColorName(col.name);
                      }}
                      className={`group relative p-1 rounded-full transition-all ${
                        isSelected
                          ? 'ring-2 ring-zinc-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      title={col.name}
                    >
                      <span
                        className="block w-7 h-7 rounded-full border border-black/15 shadow-sm"
                        style={{ backgroundColor: col.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-zinc-800">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-zinc-500 hover:text-black font-semibold text-xs"
                >
                  <Ruler className="w-3.5 h-3.5" /> Size Guide
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                  const isAvailable = design.sizes?.includes(sz);
                  const isSelected = selectedSize === sz;

                  if (!isAvailable) {
                    return (
                      <div
                        key={sz}
                        className="py-3 text-center rounded-xl bg-zinc-100 text-zinc-300 text-xs font-semibold cursor-not-allowed line-through"
                      >
                        {sz}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-3 text-center rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0A0A0A] text-white shadow-md'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order on WhatsApp Primary CTA (Point 3, 4 & 5) */}
            <div className="pt-4 space-y-3">
              {design.is_sold_out ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 px-6 rounded-2xl bg-zinc-200 text-zinc-500 font-bold text-base cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <span>Currently Sold Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOrderClick}
                  disabled={isOrdering}
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.99] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-75 cursor-pointer"
                >
                  {isOrdering ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5 fill-white stroke-none" />
                  )}
                  <span>Order on WhatsApp</span>
                </button>
              )}

              <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" /> No Card Needed
                </span>
                <span>•</span>
                <span>Pay via UPI on WhatsApp</span>
                <span>•</span>
                <span>Delivered across India</span>
              </div>
            </div>

            {/* Shipping Info read from site_settings (hidden if empty) */}
            {shippingInfo && (
              <div className="border-t border-zinc-200 pt-6 text-xs">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900 block">Shipping &amp; Fulfillment</span>
                    <span className="text-zinc-500 leading-relaxed">
                      {shippingInfo}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}
