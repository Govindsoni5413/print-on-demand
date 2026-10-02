'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { Page } from '@/types/database';
import { ArrowLeft, Save, Eye, Edit3, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PageEditorProps {
  initialData?: Partial<Page> & { id?: string };
}

export function PageEditor({ initialData }: PageEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
  const [seoDesc, setSeoDesc] = useState(initialData?.seo_description || '');
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? true);

  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast.error('Title, slug, and content are required');
      return;
    }

    // Slug validation
    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    setSubmitting(true);
    try {
      const payload = {
        title,
        slug: cleanSlug,
        content,
        seo_title: seoTitle || null,
        seo_description: seoDesc || null,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && initialData?.id) {
        const { error } = await (supabase as any)
          .from('pages')
          .update(payload)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('pages').insert(payload);
        if (error) throw error;
      }

      await triggerRevalidation([`/${cleanSlug}`], false, `/${cleanSlug}`);
      router.push('/admin/website/pages');
      router.refresh();
    } catch (err: any) {
      toast.error('Error saving page: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/website/pages"
            className="p-2 rounded-xl text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-display font-black tracking-tight text-zinc-950">
              {isEditing ? `Edit /${initialData?.slug}` : 'Create New Page'}
            </h1>
            <p className="text-xs text-zinc-500">
              Write content in Markdown with live preview and SEO metadata
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && (
            <Link
              href={`/${slug}`}
              target="_blank"
              className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:text-black hover:bg-zinc-50 transition"
              title="View on site"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Page'}</span>
          </button>
        </div>
      </div>

      {/* Basic Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
            Page Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Shipping & Returns Policy"
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
            URL Slug
          </label>
          <div className="flex items-center">
            <span className="text-xs text-zinc-400 font-mono px-2">/</span>
            <input
              type="text"
              required
              disabled={isEditing && ['about', 'contact', 'shipping-and-returns', 'privacy', 'terms', 'faq'].includes(initialData?.slug || '')}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="shipping-and-returns"
              className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 font-mono focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:bg-zinc-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-5">
          <input
            type="checkbox"
            id="page_is_published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded text-zinc-900 accent-zinc-900"
          />
          <label htmlFor="page_is_published" className="text-xs font-bold text-zinc-800 cursor-pointer">
            Published (Accessible to public)
          </label>
        </div>
      </div>

      {/* SEO Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
            SEO Title (Browser tab & search results)
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="e.g. Shipping Guidelines | REVNTRIX"
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
            SEO Description
          </label>
          <input
            type="text"
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            placeholder="Meta description for search engine snippets"
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
          />
        </div>
      </div>

      {/* Markdown Editor Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Page Content (Markdown)
        </span>

        <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'write' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'preview' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'split' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500'
            }`}
          >
            <span>Side by Side</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Write panel */}
        {(activeTab === 'write' || activeTab === 'split') && (
          <div className={`${activeTab === 'write' ? 'md:col-span-2' : ''} bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs`}>
            <div className="p-3 bg-zinc-50 border-b border-zinc-200 text-xs font-mono text-zinc-500 flex justify-between">
              <span>Markdown Source</span>
              <span>{content.length} chars</span>
            </div>
            <textarea
              rows={22}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Page Title&#10;&#10;Write markdown content here..."
              className="w-full p-4 font-mono text-xs leading-relaxed text-zinc-800 bg-white focus:outline-none resize-y min-h-[460px]"
            />
          </div>
        )}

        {/* Live Preview panel */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className={`${activeTab === 'preview' ? 'md:col-span-2' : ''} bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs flex flex-col`}>
            <div className="p-3 bg-zinc-50 border-b border-zinc-200 text-xs font-mono text-zinc-500 flex justify-between">
              <span>Live Rendered View</span>
              <span className="text-emerald-600 font-semibold">Strict Markdown (Safe)</span>
            </div>
            <div className="p-6 overflow-y-auto max-h-[560px] flex-1">
              <MarkdownContent content={content || '*No content written yet.*'} />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
