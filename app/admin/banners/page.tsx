'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Banner } from '@/types/database';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MousePointerClick,
  CheckCircle2,
  Clock,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [clickStats, setClickStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannersRes, statsRes] = await Promise.all([
        supabase
          .from('banners')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase.rpc('get_banner_click_stats'),
      ]);

      if (bannersRes.data) {
        setBanners(bannersRes.data as Banner[]);
      }

      if (statsRes.data) {
        const statsMap: Record<string, number> = {};
        statsRes.data.forEach((row: any) => {
          if (row.banner_id) {
            statsMap[row.banner_id] = Number(row.click_count);
          }
        });
        setClickStats(statsMap);
      }
    } catch (err: any) {
      toast.error('Failed to load banners: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (banner: Banner) => {
    try {
      const { error } = await (supabase as any)
        .from('banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      toast.success(banner.is_active ? 'Banner deactivated' : 'Banner activated');
      await triggerRevalidation(['/'], false);
      loadData();
    } catch (err: any) {
      toast.error('Error toggling banner: ' + err.message);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Are you sure you want to delete banner "${banner.title || 'Untitled'}"?`)) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('banners')
        .delete()
        .eq('id', banner.id);

      if (error) throw error;
      toast.success('Banner deleted');
      await triggerRevalidation(['/'], false);
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete banner: ' + err.message);
    }
  };

  const getStatusBadge = (banner: Banner) => {
    if (!banner.is_active) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500">
          Inactive
        </span>
      );
    }

    const now = new Date();
    if (banner.start_at && new Date(banner.start_at) > now) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Scheduled
        </span>
      );
    }

    if (banner.end_at && new Date(banner.end_at) < now) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 flex items-center gap-1">
          Expired
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Live
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-zinc-950">
            Homepage Banners
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage carousel drops, responsive crops, CTA buttons, and track click engagement
          </p>
        </div>

        <Link
          href="/admin/banners/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Banner</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 font-mono">
          Loading banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
          <p className="text-sm font-semibold text-zinc-800">No banners created yet</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Create your first auto-changing homepage banner to showcase drops and collections.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/banners/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Banner</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {banners.map((banner) => {
            const clicks = clickStats[banner.id] || 0;
            return (
              <div
                key={banner.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-zinc-300 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative w-28 h-16 sm:w-36 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                    <img
                      src={banner.desktop_image_url}
                      alt={banner.title || 'Banner'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      {getStatusBadge(banner)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-display font-bold text-sm text-zinc-950 truncate">
                      {banner.title || 'Untitled Banner'}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate max-w-md">
                      {banner.subtitle || 'No subtitle provided'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400 font-mono">
                      <span>Order: #{banner.sort_order}</span>
                      <span>•</span>
                      <span className="capitalize">Target: {banner.link_type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-zinc-600 font-semibold">
                        <MousePointerClick className="w-3 h-3 text-zinc-400" />
                        {clicks} clicks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      banner.is_active
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {banner.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <Link
                    href={`/admin/banners/${banner.id}`}
                    className="p-2 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(banner)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
