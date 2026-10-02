'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { HomeSection } from '@/types/database';
import {
  ArrowUp,
  ArrowDown,
  Save,
  Check,
  LayoutGrid,
  Info,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHomeSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadSections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('home_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) setSections(data as HomeSection[]);
    } catch (err: any) {
      toast.error('Failed to load sections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate sort_order
    updated.forEach((s, idx) => {
      s.sort_order = idx + 1;
    });

    setSections(updated);
  };

  const toggleEnabled = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const updateTitle = (id: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const updateSubtitle = (id: string, subtitle: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, subtitle } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        const { error } = await (supabase as any)
          .from('home_sections')
          .update({
            title: section.title,
            subtitle: section.subtitle,
            enabled: section.enabled,
            sort_order: section.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', section.id);

        if (error) throw error;
      }

      await triggerRevalidation(['/'], false, '/');
      toast.success('Homepage section layout saved');
    } catch (err: any) {
      toast.error('Failed to save layout: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getSectionBadge = (key: string) => {
    switch (key) {
      case 'banner_slider':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
            Auto-hides if 0 live banners
          </span>
        );
      case 'hero_3d':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
            Interactive 3D Visualizer
          </span>
        );
      case 'testimonials':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
            Hides if 0 reviews
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-zinc-950 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-zinc-800" />
            <span>Homepage Section Builder</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Toggle visibility and reorder sections on the homepage. Changes take effect on the live site immediately.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Section Order'}</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
        <p>
          The homepage renders enabled sections in the exact order below. If <strong>banner_slider</strong> is enabled but has zero active banners scheduled, it automatically disappears without leaving any empty gaps.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 font-mono">
          Loading layout...
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                section.enabled
                  ? 'bg-white border-zinc-200 shadow-xs'
                  : 'bg-zinc-50/60 border-zinc-200/60 opacity-60'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4 flex-1">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, 'up')}
                    className="p-1 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-20 transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => moveSection(idx, 'down')}
                    className="p-1 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-20 transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="font-mono text-xs font-bold text-zinc-400 w-6">
                  {idx + 1}.
                </div>

                {/* Section Info & Editable Titles */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 font-mono">
                      {section.key}
                    </span>
                    {getSectionBadge(section.key)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={section.title || ''}
                      onChange={(e) => updateTitle(section.id, e.target.value)}
                      placeholder="Section Title"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                    <input
                      type="text"
                      value={section.subtitle || ''}
                      onChange={(e) => updateSubtitle(section.id, e.target.value)}
                      placeholder="Section Subtitle"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Enable Toggle Switch */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={() => toggleEnabled(section.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-950"></div>
                </label>
                <span className="text-xs font-semibold text-zinc-600 w-16">
                  {section.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
