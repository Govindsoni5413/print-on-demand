'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { handleWhatsAppRedirect } from '@/lib/whatsapp';

import { createClient } from '@/lib/supabase/client';

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('whatsapp_enabled')
      .eq('id', 'default')
      .single()
      .then(({ data }) => {
        if (data && data.whatsapp_enabled === false) {
          setEnabled(false);
        }
      });
  }, []);

  // Do not show on admin pages or if disabled
  if (pathname?.startsWith('/admin') || !enabled) {
    return null;
  }

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await handleWhatsAppRedirect({
        designId: null,
        source: 'floating_button',
      });
    } finally {
      // If user returns back to tab, reset loading state
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>

        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <MessageCircle className="w-7 h-7 fill-white stroke-none" />
        )}
      </button>
    </div>
  );
}
