'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { triggerRevalidation } from '@/lib/revalidate';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Smartphone,
  ShieldAlert,
  Globe,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State with strictly neutral defaults
  const [settings, setSettings] = useState({
    id: 'default',
    brand_name: 'REVNTRIX',
    tagline: 'Streetwear T-Shirts',
    description: 'Printed to order, delivered across India.',
    accent_color: '#0A0A0A',
    email: 'revntrix@gmail.com',
    whatsapp_numbers: ['+917852811695', '+919376406174'],
    whatsapp_enabled: true,
    maintenance_mode: false,
    banner_autoplay_ms: 5000,
    banner_transition: 'fade',
    banner_autoplay_enabled: true,
    logo_url: '',
    favicon_url: '',
    og_image_url: '',
    announcement_bar: 'Printed to order • Delivered across India',
    announcement_enabled: true,
    announcement_link: '',
    announcement_start_at: '',
    announcement_end_at: '',
    footer_text: 'Printed to order, delivered across India.',
    seo_title: 'REVNTRIX | Premium Streetwear T-Shirts',
    seo_description: 'Printed to order, delivered across India. Interactive 3D visualization and direct WhatsApp ordering.',
    social_links: { instagram: '', twitter: '', whatsapp: '' },
    shipping_info: 'Orders are printed on demand and dispatched across India via tracked couriers.',
    return_policy: 'Contact our team directly on WhatsApp for any order inquiries or status updates.',
    size_guide_content: {
      note: 'Regular fit. Order your standard t-shirt size.',
      sizes: [
        { size: 'S', chest: '38 in', length: '27 in' },
        { size: 'M', chest: '40 in', length: '28 in' },
        { size: 'L', chest: '42 in', length: '29 in' },
        { size: 'XL', chest: '44 in', length: '30 in' },
        { size: 'XXL', chest: '46 in', length: '31 in' },
      ],
    },
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            whatsapp_numbers: data.whatsapp_numbers || prev.whatsapp_numbers,
            social_links: data.social_links || prev.social_links,
            announcement_start_at: data.announcement_start_at
              ? new Date(data.announcement_start_at).toISOString().slice(0, 16)
              : '',
            announcement_end_at: data.announcement_end_at
              ? new Date(data.announcement_end_at).toISOString().slice(0, 16)
              : '',
          }));
        }
      } catch (err) {
        console.warn('Using default settings state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...settings,
        banner_autoplay_ms: Number(settings.banner_autoplay_ms),
        announcement_start_at: settings.announcement_start_at
          ? new Date(settings.announcement_start_at).toISOString()
          : null,
        announcement_end_at: settings.announcement_end_at
          ? new Date(settings.announcement_end_at).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from('site_settings')
        .upsert(payload);

      if (error) throw error;

      // Point 7: Call revalidatePath('/', 'layout') via API route
      await triggerRevalidation(['/'], true, '/');
      toast.success('Site settings and branding saved');
    } catch (err: any) {
      toast.error('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChange = (index: number, val: string) => {
    const updated = [...settings.whatsapp_numbers];
    updated[index] = val;
    setSettings({ ...settings, whatsapp_numbers: updated });
  };

  const addPhone = () => {
    setSettings({
      ...settings,
      whatsapp_numbers: [...settings.whatsapp_numbers, '+91'],
    });
  };

  const removePhone = (index: number) => {
    if (settings.whatsapp_numbers.length <= 1) {
      toast.error('At least one WhatsApp concierge number is required');
      return;
    }
    const updated = settings.whatsapp_numbers.filter((_, i) => i !== index);
    setSettings({ ...settings, whatsapp_numbers: updated });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-zinc-950">
            Store &amp; Branding Settings
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Global store configuration, WhatsApp switches, maintenance mode, and branding.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* 1. Master Control Switches (WhatsApp & Maintenance Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Master Switch */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 fill-emerald-600 stroke-none" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-zinc-950">
                  WhatsApp Master Switch
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Enable or pause all WhatsApp ordering storewide
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsapp_enabled}
                onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl">
            {settings.whatsapp_enabled ? (
              <span className="text-emerald-700 font-medium">
                ✓ WhatsApp ordering is active on the storefront.
              </span>
            ) : (
              <span className="text-amber-800 font-medium">
                ⚠️ WhatsApp ordering is paused. Buttons are disabled/hidden and server APIs will reject orders with a clear notice.
              </span>
            )}
          </p>
        </div>

        {/* Maintenance Mode Switch */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-zinc-950">
                  Maintenance Mode
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Temporarily lock the storefront for maintenance
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl">
            {settings.maintenance_mode ? (
              <span className="text-amber-800 font-medium">
                ⚠️ Store is currently in Maintenance Mode. Non-admin visitors see the maintenance screen. Logged-in admins can still preview the storefront. (Edge-cached ~30s).
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">
                ✓ Storefront is live to all visitors.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 2. Visual Branding & Logos */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-zinc-500" />
          <span>Brand Assets &amp; Logo</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MediaUploader
            value={settings.logo_url}
            onChange={(url) => setSettings({ ...settings, logo_url: url })}
            folder="branding"
            label="Primary Brand Logo"
            helpText="Displayed in header and footer. Transparent PNG/SVG recommended."
          />

          <MediaUploader
            value={settings.favicon_url}
            onChange={(url) => setSettings({ ...settings, favicon_url: url })}
            folder="branding"
            label="Favicon"
            helpText="Small icon displayed in browser tab (SVG, PNG, ICO)."
          />

          <MediaUploader
            value={settings.og_image_url}
            onChange={(url) => setSettings({ ...settings, og_image_url: url })}
            folder="branding"
            label="Social Share Image (OG)"
            helpText="Preview card when site URL is shared on WhatsApp or Twitter (1200x630)."
          />
        </div>
      </div>

      {/* 3. Announcement Bar */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Announcement Bar
          </h2>
          <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.announcement_enabled}
              onChange={(e) => setSettings({ ...settings, announcement_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-zinc-900 accent-zinc-900"
            />
            <span>Enabled</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Banner Text
            </label>
            <input
              type="text"
              value={settings.announcement_bar || ''}
              onChange={(e) => setSettings({ ...settings, announcement_bar: e.target.value })}
              placeholder="e.g. Printed to order • Delivered across India"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Click Link (Optional)
            </label>
            <input
              type="text"
              value={settings.announcement_link || ''}
              onChange={(e) => setSettings({ ...settings, announcement_link: e.target.value })}
              placeholder="e.g. /shop or /about"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Schedule Start (Optional)
            </label>
            <input
              type="datetime-local"
              value={settings.announcement_start_at || ''}
              onChange={(e) => setSettings({ ...settings, announcement_start_at: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Schedule End (Optional)
            </label>
            <input
              type="datetime-local"
              value={settings.announcement_end_at || ''}
              onChange={(e) => setSettings({ ...settings, announcement_end_at: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200"
            />
          </div>
        </div>
      </div>

      {/* 4. Banner Carousel Autoplay Settings */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-500" />
          <span>Homepage Banner Slider Behavior</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="banner_autoplay"
              checked={settings.banner_autoplay_enabled}
              onChange={(e) => setSettings({ ...settings, banner_autoplay_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-zinc-900 accent-zinc-900"
            />
            <label htmlFor="banner_autoplay" className="text-xs font-bold text-zinc-800 cursor-pointer">
              Autoplay Active
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Slide Duration (ms)
            </label>
            <input
              type="number"
              step="500"
              min="2000"
              max="15000"
              value={settings.banner_autoplay_ms}
              onChange={(e) => setSettings({ ...settings, banner_autoplay_ms: Number(e.target.value) })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 font-mono"
            />
            <span className="text-[10px] text-zinc-400 mt-0.5 block">5000ms = 5 seconds</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Transition Style
            </label>
            <select
              value={settings.banner_transition}
              onChange={(e) => setSettings({ ...settings, banner_transition: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
            >
              <option value="fade">Smooth Fade</option>
              <option value="slide">Horizontal Slide</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. WhatsApp Numbers (Atomic Round-Robin Pool) */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              WhatsApp Concierge Numbers
            </h2>
            <p className="text-xs text-zinc-500">
              Orders rotate through these numbers atomically with lead codes (RVX-1001, etc.)
            </p>
          </div>
          <button
            type="button"
            onClick={addPhone}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Number</span>
          </button>
        </div>

        <div className="space-y-2">
          {settings.whatsapp_numbers.map((phone, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 w-16">Line {idx + 1}</span>
              <input
                type="text"
                value={phone}
                onChange={(e) => handlePhoneChange(idx, e.target.value)}
                placeholder="+91..."
                className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-zinc-200 font-mono"
              />
              <button
                type="button"
                onClick={() => removePhone(idx)}
                className="p-2 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                title="Remove number"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Basic Store Identity & SEO */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
          Storefront Identity &amp; SEO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Brand Name
            </label>
            <input
              type="text"
              value={settings.brand_name || ''}
              onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Global SEO Title
            </label>
            <input
              type="text"
              value={settings.seo_title || ''}
              onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Global SEO Description
            </label>
            <input
              type="text"
              value={settings.seo_description || ''}
              onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
