'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { SAMPLE_DESIGNS, SAMPLE_CATEGORIES } from '@/lib/data/sample-designs';
import { createClient } from '@/lib/supabase/client';
import { Search, SlidersHorizontal, Shirt } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [designs, setDesigns] = useState<any[]>(SAMPLE_DESIGNS);
  const [categories, setCategories] = useState<any[]>(SAMPLE_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [catRes, designRes] = await Promise.all([
          supabase.from('categories').select('*').order('sort_order'),
          supabase
            .from('designs')
            .select('*, categories(name, slug)')
            .eq('status', 'published')
            .order('sort_order', { ascending: true }),
        ]);

        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
        if (designRes.data && designRes.data.length > 0) {
          setDesigns(designRes.data);
        }
      } catch (err) {
        console.warn('Using sample catalog data:', err);
      }
    };

    fetchCatalog();
  }, []);

  const filteredDesigns = useMemo(() => {
    return designs
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          item.category_slug === selectedCategory ||
          item.categories?.slug === selectedCategory;

        const matchesSearch =
          !searchQuery ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [designs, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0A0A0A]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
        {/* Title Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-1">
            Streetwear Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-zinc-950">
            All T-Shirt Drops
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-2 max-w-xl">
            Printed to order on heavyweight cotton. Select your artwork and order seamlessly on WhatsApp.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="space-y-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              All Drops ({designs.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id || c.slug}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === c.slug
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search t-shirts, anime, typography..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-zinc-400 flex items-center gap-1 font-semibold">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredDesigns.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-zinc-50 border border-dashed border-zinc-200">
            <Shirt className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-800">No t-shirts match your criteria</h3>
            <p className="text-xs text-zinc-400 mt-1">Try clearing your search query or switching categories.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDesigns.map((design) => (
              <ProductCard
                key={design.id}
                design={{
                  ...design,
                  category_name: design.categories?.name,
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
