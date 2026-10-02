'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatINR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const supabase = createClient();

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData);

      let query = supabase
        .from('designs')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data: designData } = await query;
      if (designData) setDesigns(designData);
    } catch (err) {
      console.warn('Failed to load designs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory]);

  const togglePublishStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('designs')
        .update({ status: nextStatus, updated_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
      setDesigns((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
      );
      toast.success(`Design set to ${nextStatus}`);
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const deleteDesign = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('designs').delete().eq('id', id);
      if (error) throw error;
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      toast.success('Design deleted');
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const filteredDesigns = designs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-zinc-900 tracking-tight">
            Design Catalog
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage t-shirt artworks, pricing, inventory colors, and live 3D models
          </p>
        </div>

        <Link href="/admin/designs/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Design
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        {filteredDesigns.length === 0 ? (
          <div className="p-16 text-center">
            <Shirt className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-700">No designs found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Add your first streetwear design to begin showcasing it on the 3D storefront.
            </p>
            <Link href="/admin/designs/new" className="inline-block mt-4">
              <Button size="sm">
                <Plus className="w-3.5 h-3.5 mr-1" /> Create Design
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-3.5">Artwork</th>
                  <th className="px-6 py-3.5">Title &amp; Slug</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Price / MRP</th>
                  <th className="px-6 py-3.5">Colors</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {filteredDesigns.map((design) => (
                  <tr key={design.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-200 flex items-center justify-center p-1.5 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={design.design_image_url}
                          alt={design.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                        {design.title}
                        {design.is_featured && (
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-400 mt-0.5">
                        /{design.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {design.categories?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-900">{formatINR(design.price)}</span>
                      <span className="text-[11px] text-zinc-400 line-through ml-1.5">
                        {formatINR(design.mrp)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {design.colors?.map((c: any, i: number) => (
                          <span
                            key={i}
                            title={c.name}
                            className="w-3.5 h-3.5 rounded-full border border-black/15"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublishStatus(design.id, design.status)}
                        className="cursor-pointer"
                        title="Click to toggle publish status"
                      >
                        {design.status === 'published' ? (
                          <Badge variant="success">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/product/${design.slug}`}
                          target="_blank"
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                          title="View Live Product Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/designs/${design.id}`}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                          title="Edit Design"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteDesign(design.id, design.title)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Design"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
