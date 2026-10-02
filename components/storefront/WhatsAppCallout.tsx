'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { handleWhatsAppRedirect } from '@/lib/whatsapp';

interface WhatsAppCalloutProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export function WhatsAppCallout({
  title = 'HAVE A CUSTOM PRINT REQUEST?',
  subtitle = 'We collaborate with streetwear creators, artists, and collegiate squads. Reach out directly on WhatsApp to discuss bulk orders.',
  buttonText = 'Message on WhatsApp',
}: WhatsAppCalloutProps) {
  return (
    <section className="py-16 bg-[#0A0A0A] text-white">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight uppercase">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          {subtitle}
        </p>
        <div>
          <button
            type="button"
            onClick={() => handleWhatsAppRedirect({ source: 'direct' })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
