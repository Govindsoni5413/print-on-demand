'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageCircle, ArrowRight } from 'lucide-react';
import { handleWhatsAppRedirect } from '@/lib/whatsapp';
import { createClient } from '@/lib/supabase/client';
import { MenuItem, SiteSettings } from '@/types/database';

interface HeaderProps {
  initialSettings?: Partial<SiteSettings> | null;
  initialMenuItems?: MenuItem[] | null;
  announcement?: string;
}

export function Header({
  initialSettings,
  initialMenuItems,
  announcement,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(initialSettings || null);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(initialMenuItems || null);
  const pathname = usePathname();

  useEffect(() => {
    // If not provided server-side, fetch from client
    if (!initialSettings || !initialMenuItems) {
      const supabase = createClient();
      const load = async () => {
        try {
          const [setRes, menuRes] = await Promise.all([
            supabase.from('site_settings').select('*').eq('id', 'default').single(),
            supabase.from('menu_items').select('*').eq('location', 'header').eq('is_active', true).order('sort_order', { ascending: true }),
          ]);
          if (setRes.data) setSettings(setRes.data);
          if (menuRes.data) setMenuItems(menuRes.data);
        } catch (e) {
          console.warn('Header client fetch error:', e);
        }
      };
      load();
    }
  }, [initialSettings, initialMenuItems]);

  // Default fallback links if database menu is empty
  const defaultNavLinks = [
    { label: 'Shop All', url: '/shop' },
    { label: 'Cyberpunk', url: '/shop?category=cyberpunk-anime' },
    { label: 'Typography', url: '/shop?category=streetwear-typography' },
    { label: 'Vintage', url: '/shop?category=vintage-grunge' },
    { label: 'Minimal', url: '/shop?category=abstract-minimal' },
    { label: 'About', url: '/about' },
  ];

  const links = (menuItems && menuItems.length > 0)
    ? menuItems.map((m) => ({ label: m.label, url: m.url, openInNewTab: m.open_in_new_tab }))
    : defaultNavLinks;

  const announcementText = announcement || settings?.announcement_bar || 'Printed to order • Delivered across India';
  const showAnnouncement = settings?.announcement_enabled !== false && Boolean(announcementText);
  const whatsappEnabled = settings?.whatsapp_enabled !== false;

  return (
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100">
      {/* Top Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-[#0A0A0A] text-white text-[11px] font-medium py-1.5 px-4 text-center tracking-wider uppercase">
          {settings?.announcement_link ? (
            <Link href={settings.announcement_link} className="hover:underline inline-flex items-center gap-1.5">
              <span>{announcementText}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <span>{announcementText}</span>
          )}
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -ml-2 text-zinc-800"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.brand_name || 'REVNTRIX'}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="font-display font-black text-2xl tracking-tighter text-[#0A0A0A]">
              {settings?.brand_name || 'REVNTRIX'}
            </span>
          )}
          <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded">
            INDIA
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-600">
          {links.map((link) => {
            const isActive = pathname === link.url;
            return (
              <Link
                key={link.url + link.label}
                href={link.url}
                target={('openInNewTab' in link && link.openInNewTab) ? '_blank' : undefined}
                rel={('openInNewTab' in link && link.openInNewTab) ? 'noopener noreferrer' : undefined}
                className={`transition-colors hover:text-black py-1 relative ${
                  isActive ? 'text-black font-bold' : ''
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: WhatsApp Concierge Button */}
        <div className="flex items-center gap-3">
          {whatsappEnabled && (
            <button
              onClick={() => handleWhatsAppRedirect({ source: 'direct' })}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#25D366] hover:bg-[#20BD5A] text-white transition-all shadow-sm active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">WhatsApp Order</span>
              <span className="sm:hidden">Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2 pt-2">
            {links.map((link) => (
              <Link
                key={link.url + link.label}
                href={link.url}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  pathname === link.url
                    ? 'bg-zinc-100 text-black font-bold'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {whatsappEnabled && (
            <div className="pt-3 border-t border-zinc-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleWhatsAppRedirect({ source: 'direct' });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Instant Order on WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
