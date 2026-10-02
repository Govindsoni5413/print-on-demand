import React from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  design: {
    id: string;
    title: string;
    slug: string;
    price: number;
    mrp: number;
    design_image_url: string;
    colors?: { name: string; hex: string }[];
    is_new_drop?: boolean;
    category_name?: string;
  };
}

export function ProductCard({ design }: ProductCardProps) {
  const discountPercent = Math.round(((design.mrp - design.price) / design.mrp) * 100);

  return (
    <Link
      href={`/product/${design.slug}`}
      className="group block bg-white rounded-2xl border border-zinc-200/80 overflow-hidden hover:border-zinc-900 transition-all duration-300 hover:shadow-lg flex flex-col"
    >
      {/* Visual Thumbnail Frame */}
      <div className="relative aspect-square bg-[#0F0F11] flex items-center justify-center p-6 overflow-hidden">
        {design.is_new_drop && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">
            New Drop
          </span>
        )}

        {discountPercent > 0 && (
          <span className="absolute top-3 right-3 z-10 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-md">
            {discountPercent}% OFF
          </span>
        )}

        {/* T-Shirt Graphic Representation */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={design.design_image_url}
          alt={design.title}
          className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            View in 3D <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {design.category_name && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              {design.category_name}
            </span>
          )}
          <h3 className="font-display font-bold text-sm text-zinc-900 group-hover:text-black line-clamp-1">
            {design.title}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm text-zinc-900">{formatINR(design.price)}</span>
            {design.mrp > design.price && (
              <span className="text-xs text-zinc-400 line-through">
                {formatINR(design.mrp)}
              </span>
            )}
          </div>

          {/* Color Dots */}
          {design.colors && design.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {design.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  title={c.name}
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {design.colors.length > 4 && (
                <span className="text-[9px] text-zinc-400">+{design.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
