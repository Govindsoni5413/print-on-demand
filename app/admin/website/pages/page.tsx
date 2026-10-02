'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Page } from '@/types/database';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      if (data) setPages(data as Page[]);
    } catch (err: any) {
      toast.error('Failed to load pages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleDelete = async (page: Page) => {
    if (['about', 'contact', 'shipping-and-returns', 'privacy', 'terms', 'faq'].includes(page.slug)) {
      if (!confirm(`Warning: "${page.slug}" is a core storefront route. Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!confirm(`Delete page "${page.title}"?`)) return;
    }

    try {
      const { error } = await (supabase as any)
        .from('pages')
        .delete()
        .eq('id', page.id);

      if (error) throw error;
      toast.success('Page deleted');
      await triggerRevalidation([`/${page.slug}`], false);
      loadPages();
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-zinc-950 flex items-center gap-2">
            <FileText className="w-6 h-6 text-zinc-800" />
            <span>Storefront Pages &amp; Markdown</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage static and legal policy pages with live Markdown rendering and custom SEO meta tags.
          </p>
        </div>

        <Link
          href="/admin/website/pages/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Page</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 font-mono">
          Loading pages...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {pages.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-300 transition"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-base text-zinc-950">
                    {p.title}
                  </h3>
                  <span className="font-mono text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                    /{p.slug}
                  </span>
                  {p.is_published ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Published
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate max-w-lg">
                  {p.seo_description || 'No SEO description set'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/${p.slug}`}
                  target="_blank"
                  className="p-2 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                  title="View Live Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href={`/admin/website/pages/${p.slug}`}
                  className="p-2 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                  title="Edit Page"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
