'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DesignFormSchema, DesignFormData } from '@/lib/validations/design';
import { createClient } from '@/lib/supabase/client';
import { TshirtCanvas } from '@/components/3d/TshirtCanvas';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface DesignFormProps {
  initialData?: Partial<DesignFormData> & { id?: string };
  categories?: { id: string; name: string }[];
}

export function DesignForm({ initialData, categories = [] }: DesignFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewColor, setPreviewColor] = useState('#121212');

  const supabase = createClient();

  const defaultValues: DesignFormData = {
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category_id: initialData?.category_id || (categories[0]?.id || null),
    tags: initialData?.tags || ['streetwear', 'oversized'],
    price: initialData?.price || 899,
    mrp: initialData?.mrp || 1499,
    colors: initialData?.colors || [
      { name: 'Onyx Black', hex: '#121212', inStock: true },
      { name: 'Chalk White', hex: '#FFFFFF', inStock: true },
    ],
    sizes: initialData?.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
    design_image_url: initialData?.design_image_url || '/designs/neo-tokyo.svg',
    placement: initialData?.placement || 'chest',
    design_scale: initialData?.design_scale || 1.0,
    status: initialData?.status || 'draft',
    is_featured: initialData?.is_featured || false,
    is_new_drop: initialData?.is_new_drop || false,
    is_sold_out: initialData?.is_sold_out || false,
    sort_order: initialData?.sort_order || 0,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<DesignFormData>({
    resolver: zodResolver(DesignFormSchema),
    defaultValues,
  });

  const watchedGraphicUrl = watch('design_image_url');
  const watchedPlacement = watch('placement');
  const watchedScale = watch('design_scale');
  const watchedColors = watch('colors');
  const watchedSizes = watch('sizes');

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    setValue('title', titleVal);
    if (!isEditing) {
      const generatedSlug = titleVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug);
    }
  };

  // Color management
  const addColorVariant = () => {
    const current = watch('colors');
    setValue('colors', [...current, { name: 'Acid Green', hex: '#22c55e', inStock: true }]);
  };

  const removeColorVariant = (index: number) => {
    const current = watch('colors');
    if (current.length <= 1) {
      toast.error('Must retain at least one color');
      return;
    }
    setValue(
      'colors',
      current.filter((_, i) => i !== index)
    );
  };

  // Size management
  const toggleSize = (size: string) => {
    const current = watch('sizes');
    if (current.includes(size)) {
      if (current.length <= 1) {
        toast.error('Must have at least one size');
        return;
      }
      setValue('sizes', current.filter((s) => s !== size));
    } else {
      setValue('sizes', [...current, size]);
    }
  };

  const onSubmit = async (data: DesignFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('designs')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Design updated successfully');
      } else {
        const { error } = await supabase.from('designs').insert(data as any);
        if (error) throw error;
        toast.success('Design created and saved');
      }

      router.push('/admin/designs');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save design');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Designs
        </button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/designs')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Create Design'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-6">
          {/* General Information Card */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Product Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Design Title *
              </label>
              <input
                {...register('title')}
                onChange={handleTitleChange}
                placeholder="e.g. NEO TOKYO 2099"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
              {errors.title && (
                <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  URL Slug *
                </label>
                <input
                  {...register('slug')}
                  placeholder="neo-tokyo-2099"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
                {errors.slug && (
                  <p className="text-xs text-rose-600 mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Category
                </label>
                <select
                  {...register('category_id')}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Product Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="High-definition print on 100% combed cotton..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Pricing & Visibility Card */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Pricing &amp; Catalog Status
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Sale Price (₹ INR) *
                </label>
                <input
                  type="number"
                  {...register('price')}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white font-mono"
                />
                {errors.price && (
                  <p className="text-xs text-rose-600 mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  MRP Price (₹ INR) *
                </label>
                <input
                  type="number"
                  {...register('mrp')}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white font-mono"
                />
                {errors.mrp && (
                  <p className="text-xs text-rose-600 mt-1">{errors.mrp.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-zinc-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-800">
                <input
                  type="checkbox"
                  {...register('status', {
                    setValueAs: (v) => (v ? 'published' : 'draft'),
                  })}
                  defaultChecked={defaultValues.status === 'published'}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                Published
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-800">
                <input
                  type="checkbox"
                  {...register('is_featured')}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                Featured Drop
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-800">
                <input
                  type="checkbox"
                  {...register('is_new_drop')}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                New Release
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-amber-700">
                <input
                  type="checkbox"
                  {...register('is_sold_out')}
                  className="w-4 h-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-600"
                />
                Sold Out
              </label>
            </div>
          </div>

          {/* Graphic & Placement Card */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Artwork &amp; 3D Placement
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Design Graphic URL (Transparent PNG or SVG) *
              </label>
              <input
                {...register('design_image_url')}
                placeholder="/designs/neo-tokyo.svg or https://..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Use transparent background files for high realism on the 3D t-shirt canvas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Print Placement
                </label>
                <select
                  {...register('placement')}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                >
                  <option value="chest">Chest (Standard Streetwear)</option>
                  <option value="center">Center Torso (Oversized Graphic)</option>
                  <option value="back">Back Statement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Scale: {watchedScale}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  {...register('design_scale')}
                  className="w-full mt-2 accent-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Color & Size Variants Card */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Color Variants
              </h2>
              <button
                type="button"
                onClick={addColorVariant}
                className="inline-flex items-center gap-1 text-xs text-zinc-900 hover:text-zinc-600 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Color
              </button>
            </div>

            <div className="space-y-3">
              {watchedColors.map((color, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => {
                      const updated = [...watchedColors];
                      updated[index].hex = e.target.value;
                      setValue('colors', updated);
                      setPreviewColor(e.target.value);
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => {
                      const updated = [...watchedColors];
                      updated[index].name = e.target.value;
                      setValue('colors', updated);
                    }}
                    placeholder="Color Name (e.g. Onyx Black)"
                    className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeColorVariant(index)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sizes */}
            <div className="pt-4 border-t border-zinc-100">
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                  const isSelected = watchedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        {/* Right Sticky 3D Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-zinc-900" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Live 3D Decal Preview
                  </h3>
                </div>
                <span className="text-[10px] text-zinc-400">Drag to rotate</span>
              </div>

              {/* 3D Canvas Box */}
              <div className="w-full h-80 bg-zinc-100/60 rounded-2xl relative overflow-hidden flex items-center justify-center">
                <TshirtCanvas
                  color={previewColor}
                  designImageUrl={watchedGraphicUrl}
                  placement={watchedPlacement}
                  scale={watchedScale}
                  autoRotate={false}
                  interactive={true}
                  className="w-full h-full"
                />
              </div>

              {/* Live Color Switcher */}
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                  Test Color Variant on 3D Shirt
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {watchedColors.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewColor(col.hex)}
                      className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        previewColor === col.hex
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
