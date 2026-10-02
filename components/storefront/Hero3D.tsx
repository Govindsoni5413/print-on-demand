'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TshirtCanvas } from '@/components/3d/TshirtCanvas';
import { handleWhatsAppRedirect } from '@/lib/whatsapp';
import { Sparkles, MessageCircle, ArrowRight, Rotate3D } from 'lucide-react';

interface Hero3DProps {
  title?: string;
  subtitle?: string;
  description?: string;
  whatsappEnabled?: boolean;
}

const HERO_COLORS = [
  { name: 'Onyx Black', hex: '#121212' },
  { name: 'Off White', hex: '#F3F3EF' },
  { name: 'Acid Violet', hex: '#5D3FD3' },
  { name: 'Olive Drab', hex: '#4A5320' },
];

export function Hero3D({
  title = 'PRINTED TO ORDER.\nORDER ON WHATSAPP.',
  subtitle = 'Interactive 3D Preview',
  description = 'Printed to order, delivered across India. Explore interactive 3D visualizations, pick your colorway, and order directly via WhatsApp with zero checkout friction.',
  whatsappEnabled = true,
}: Hero3DProps) {
  const [heroColor, setHeroColor] = useState('#121212');
  const [heroColorName, setHeroColorName] = useState('Onyx Black');

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/60 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{subtitle}</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-[1.08] text-zinc-950 whitespace-pre-line">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-zinc-950 text-white font-bold text-sm hover:bg-zinc-800 transition active:scale-98 shadow-md"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {whatsappEnabled && (
              <button
                type="button"
                onClick={() => handleWhatsAppRedirect({ source: 'direct' })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-zinc-200 bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-50 transition active:scale-98 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>Chat with Stylist</span>
              </button>
            )}
          </div>
        </div>

        {/* Right 3D Visualizer */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[480px] rounded-3xl bg-radial from-zinc-100 to-zinc-200/50 border border-zinc-200/80 shadow-2xl overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold">
              <Rotate3D className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Drag to rotate</span>
            </div>

            <TshirtCanvas
              color={heroColor}
              designImageUrl="/designs/neo-tokyo.svg"
              placement="chest"
              scale={1.1}
              interactive={true}
              autoRotate={true}
              floating={true}
              className="w-full h-full"
            />

            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] text-zinc-400 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm">
                Drop: NEO TOKYO 2099
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm">
                {heroColorName}
              </span>
            </div>
          </div>

          {/* Color Swatch Picker */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Test Colorway:
            </span>
            <div className="flex items-center gap-2">
              {HERO_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    setHeroColor(c.hex);
                    setHeroColorName(c.name);
                  }}
                  className={`group relative p-1 rounded-full transition-all ${
                    heroColor === c.hex ? 'ring-2 ring-black scale-110' : 'hover:scale-105'
                  }`}
                  title={c.name}
                >
                  <span
                    className="block w-6 h-6 rounded-full border border-black/20"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
