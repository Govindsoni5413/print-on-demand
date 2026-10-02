'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BannerSchema } from '@/lib/validations/cms';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { createClient } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Banner } from '@/types/database';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  Eye,
  Calendar,
  Layers,
  Link as LinkIcon,
  Check,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

interface BannerFormProps {
  initialData?: Partial<Banner> & { id?: string };
  designs?: { id: string; title: string; slug: string }[];
  categories?: { id: string; name: string; slug: string }[];
}

export function BannerForm({
  initialData,
  designs = [],
  categories = [],
}: BannerFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [submitting, setSubmitting] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const supabase = createClient();

  const defaultValues = {
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    cta_text: initialData?.cta_text || '',
    link_type: (initialData?.link_type as any) || 'shop',
    link_target: initialData?.link_target || '',
    desktop_image_url: initialData?.desktop_image_url || '/banners/banner-1-desktop.svg',
    mobile_image_url: initialData?.mobile_image_url || '/banners/banner-1-mobile.svg',
    text_mode: (initialData?.text_mode as any) || 'overlay',
    text_align: (initialData?.text_align as any) || 'left',
    text_color: (initialData?.text_color as any) || 'light',
    overlay_opacity: initialData?.overlay_opacity ?? 30,
    start_at: initialData?.start_at ? new Date(initialData.start_at).toISOString().slice(0, 16) : '',
    end_at: initialData?.end_at ? new Date(initialData.end_at).toISOString().slice(0, 16) : '',
    is_active: initialData?.is_active ?? true,
    sort_order: initialData?.sort_order ?? 0,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(BannerSchema),
    defaultValues,
  });

  const values = watch();

  const onSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        cta_text: formData.cta_text || '',
        link_type: formData.link_type,
        link_target: formData.link_target || '',
        desktop_image_url: formData.desktop_image_url,
        mobile_image_url: formData.mobile_image_url || null,
        text_mode: formData.text_mode,
        text_align: formData.text_align,
        text_color: formData.text_color,
        overlay_opacity: Number(formData.overlay_opacity),
        start_at: formData.start_at ? new Date(formData.start_at).toISOString() : null,
        end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null,
        is_active: formData.is_active,
        sort_order: Number(formData.sort_order),
        updated_at: new Date().toISOString(),
      };

      if (isEditing && initialData?.id) {
        const { error } = await (supabase as any)
          .from('banners')
          .update(payload)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('banners').insert(payload);
        if (error) throw error;
      }

      await triggerRevalidation(['/'], false, '/');
      router.push('/admin/banners');
      router.refresh();
    } catch (err: any) {
      toast.error('Failed to save banner: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Preview computations
  const isMobile = previewDevice === 'mobile';
  const previewImg = isMobile && values.mobile_image_url ? values.mobile_image_url : values.desktop_image_url;
  const isLightText = values.text_color === 'light';
  const overlayBg = isLightText
    ? `rgba(0,0,0, ${(values.overlay_opacity || 0) / 100})`
    : `rgba(255,255,255, ${(values.overlay_opacity || 0) / 100})`;

  let alignContainer = 'items-start text-left';
  let alignText = 'text-left';
  if (values.text_align === 'center') {
    alignContainer = 'items-center text-center mx-auto';
    alignText = 'text-center';
  } else if (values.text_align === 'right') {
    alignContainer = 'items-end text-right ml-auto';
    alignText = 'text-right';
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/banners"
            className="p-2 rounded-xl text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-display font-black tracking-tight text-zinc-950">
              {isEditing ? 'Edit Banner' : 'Create New Banner'}
            </h1>
            <p className="text-xs text-zinc-500">
              Configure imagery, text overlay, link target, and scheduling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/banners"
            className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold hover:bg-zinc-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Banner'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Media Assets */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-500" />
              <span>1. Banner Imagery</span>
            </h2>

            <div className="space-y-4">
              <Controller
                name="desktop_image_url"
                control={control}
                render={({ field }) => (
                  <MediaUploader
                    value={field.value}
                    onChange={field.onChange}
                    folder="banners"
                    label="Desktop Banner (1920x800 recommended)"
                    helpText="Wide landscape format for desktop and tablet screens (max 5MB)"
                  />
                )}
              />
              {errors.desktop_image_url && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.desktop_image_url.message as string}
                </p>
              )}

              <Controller
                name="mobile_image_url"
                control={control}
                render={({ field }) => (
                  <MediaUploader
                    value={field.value}
                    onChange={field.onChange}
                    folder="banners"
                    label="Mobile Banner (1080x1350 portrait / 1:1 square)"
                    helpText="Portrait crop served to mobile devices (< 768px) to eliminate letterboxing"
                  />
                )}
              />
            </div>
          </div>

          {/* 2. Text Content & Styling */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                2. Content Overlay
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500 font-medium">Mode:</label>
                <select
                  {...register('text_mode')}
                  className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1 font-semibold bg-zinc-50"
                >
                  <option value="overlay">Text Overlay</option>
                  <option value="image_only">Image Only (No Text)</option>
                </select>
              </div>
            </div>

            {values.text_mode === 'overlay' ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="e.g. CYBERPUNK TOKYO 2099"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 font-display font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    {...register('subtitle')}
                    placeholder="e.g. Next-gen high-definition streetwear drops."
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    {...register('cta_text')}
                    placeholder="e.g. Explore Collection"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Text Align
                    </label>
                    <select
                      {...register('text_align')}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Text Theme
                    </label>
                    <select
                      {...register('text_color')}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                    >
                      <option value="light">Light (White)</option>
                      <option value="dark">Dark (Black)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Scrim Opacity: {values.overlay_opacity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      {...register('overlay_opacity', { valueAsNumber: true })}
                      className="w-full accent-zinc-900 mt-2"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-50 rounded-xl text-xs text-zinc-500">
                In <strong>Image Only</strong> mode, no text or CTA buttons are rendered. The entire banner graphic will act as a clickable button to the destination link.
              </div>
            )}
          </div>

          {/* 3. Link Target & Routing */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-zinc-500" />
              <span>3. Link Destination</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Destination Type
                </label>
                <select
                  {...register('link_type')}
                  onChange={(e) => {
                    setValue('link_type', e.target.value as any);
                    if (e.target.value === 'shop') setValue('link_target', '/shop');
                    if (e.target.value === 'whatsapp') setValue('link_target', '');
                  }}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold"
                >
                  <option value="shop">Catalog (/shop)</option>
                  <option value="category">Category / Collection</option>
                  <option value="design">Specific Design / Product</option>
                  <option value="whatsapp">Direct WhatsApp</option>
                  <option value="custom">Custom URL / Path</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Target Destination
                </label>

                {values.link_type === 'shop' && (
                  <input
                    type="text"
                    disabled
                    value="/shop"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-500 font-mono"
                  />
                )}

                {values.link_type === 'category' && (
                  <select
                    {...register('link_target')}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white font-semibold"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                )}

                {values.link_type === 'design' && (
                  <select
                    {...register('link_target')}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white font-semibold"
                  >
                    <option value="">Select Design...</option>
                    {designs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.slug})
                      </option>
                    ))}
                  </select>
                )}

                {values.link_type === 'whatsapp' && (
                  <input
                    type="text"
                    {...register('link_target')}
                    placeholder="Optional message text or blank"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white font-mono"
                  />
                )}

                {values.link_type === 'custom' && (
                  <input
                    type="text"
                    {...register('link_target')}
                    placeholder="e.g. /about or https://example.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white font-mono"
                  />
                )}

                {errors.link_target && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.link_target.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Scheduling & Status */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>4. Scheduling &amp; Status</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  {...register('start_at')}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  {...register('end_at')}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  className="w-4 h-4 rounded text-zinc-900 accent-zinc-900"
                />
                <label htmlFor="is_active" className="text-xs font-bold text-zinc-800 cursor-pointer">
                  Active (Display in carousel)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  {...register('sort_order', { valueAsNumber: true })}
                  className="w-24 text-xs px-3 py-1.5 rounded-xl border border-zinc-200 bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview Simulator */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Live Preview Simulator
            </span>

            {/* Device Toggle */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-black'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-black'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (390px)</span>
              </button>
            </div>
          </div>

          {/* Simulator Frame */}
          <div className="flex justify-center bg-zinc-950/5 border border-zinc-200/80 rounded-2xl p-4 overflow-hidden">
            <div
              className={`relative overflow-hidden rounded-xl border border-zinc-800 bg-black transition-all duration-300 shadow-xl ${
                isMobile ? 'w-[320px] aspect-[4/5]' : 'w-full aspect-[16/9]'
              }`}
            >
              {/* Graphic */}
              {previewImg ? (
                <img
                  src={previewImg}
                  alt="Preview"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
                  No image selected
                </div>
              )}

              {/* Scrim Overlay */}
              <div
                className="absolute inset-0 pointer-events-none transition-colors duration-300"
                style={{ backgroundColor: overlayBg }}
              />

              {/* Text Overlay */}
              {values.text_mode === 'overlay' && (
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 pointer-events-none">
                  <div className={`flex flex-col ${alignContainer} space-y-1.5`}>
                    {values.title && (
                      <h3
                        className={`text-lg sm:text-2xl font-display font-black tracking-tight uppercase leading-tight drop-shadow-md ${
                          isLightText ? 'text-white' : 'text-zinc-950'
                        } ${alignText}`}
                      >
                        {values.title}
                      </h3>
                    )}
                    {values.subtitle && (
                      <p
                        className={`text-[10px] sm:text-xs font-medium max-w-xs leading-relaxed drop-shadow ${
                          isLightText ? 'text-zinc-200' : 'text-zinc-800'
                        } ${alignText}`}
                      >
                        {values.subtitle}
                      </p>
                    )}
                    {values.cta_text && (
                      <div className="pt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md ${
                            values.link_type === 'whatsapp'
                              ? 'bg-emerald-500 text-white'
                              : isLightText
                              ? 'bg-white text-zinc-950'
                              : 'bg-zinc-950 text-white'
                          }`}
                        >
                          {values.link_type === 'whatsapp' ? (
                            <MessageCircle className="w-3 h-3 fill-white" />
                          ) : null}
                          <span>{values.cta_text}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
