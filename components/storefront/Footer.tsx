'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MenuItem, SiteSettings } from '@/types/database';

interface FooterProps {
  initialSettings?: Partial<SiteSettings> | null;
  initialMenuItems?: MenuItem[] | null;
}

export function Footer({ initialSettings, initialMenuItems }: FooterProps) {
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(initialSettings || null);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(initialMenuItems || null);

  useEffect(() => {
    if (!initialSettings || !initialMenuItems) {
      const supabase = createClient();
      const load = async () => {
        try {
          const [setRes, menuRes] = await Promise.all([
            supabase.from('site_settings').select('*').eq('id', 'default').single(),
            supabase.from('menu_items').select('*').eq('location', 'footer').eq('is_active', true).order('sort_order', { ascending: true }),
          ]);
          if (setRes.data) setSettings(setRes.data);
          if (menuRes.data) setMenuItems(menuRes.data);
        } catch (e) {
          console.warn('Footer client fetch error:', e);
        }
      };
      load();
    }
  }, [initialSettings, initialMenuItems]);

  const defaultFooterLinks = [
    { label: 'All T-Shirts', url: '/shop' },
    { label: 'About REVNTRIX', url: '/about' },
    { label: 'Shipping & Returns', url: '/shipping-and-returns' },
    { label: 'FAQ', url: '/faq' },
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms of Service', url: '/terms' },
    { label: 'Contact Us', url: '/contact' },
  ];

  const links = (menuItems && menuItems.length > 0)
    ? menuItems.map((m) => ({ label: m.label, url: m.url, openInNewTab: m.open_in_new_tab }))
    : defaultFooterLinks;

  const socialLinks = (settings?.social_links as Record<string, string>) || {};

  return (
    <footer className="bg-zinc-950 text-white pt-16 pb-12 mt-auto border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="inline-block">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.brand_name || 'REVNTRIX'}
                className="h-7 w-auto object-contain brightness-0 invert"
              />
            ) : (
              <span className="font-display font-black text-2xl tracking-tight block">
                {settings?.brand_name || 'REVNTRIX'}
              </span>
            )}
          </Link>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {settings?.footer_text || settings?.description || 'Printed to order, delivered across India.'}
          </p>
          <div className="text-xs text-zinc-500 font-mono">
            Crafted for streetwear enthusiasts.
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">
            Catalog
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
            <li>
              <Link href="/shop" className="hover:text-white transition-colors">
                All T-Shirts
              </Link>
            </li>
            <li>
              <Link href="/shop?category=cyberpunk-anime" className="hover:text-white transition-colors">
                Cyberpunk &amp; Anime
              </Link>
            </li>
            <li>
              <Link href="/shop?category=streetwear-typography" className="hover:text-white transition-colors">
                Streetwear Typography
              </Link>
            </li>
            <li>
              <Link href="/shop?category=vintage-grunge" className="hover:text-white transition-colors">
                Vintage Grunge
              </Link>
            </li>
            <li>
              <Link href="/shop?category=abstract-minimal" className="hover:text-white transition-colors">
                Abstract &amp; Minimal
              </Link>
            </li>
          </ul>
        </div>

        {/* Information & CMS Pages Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">
            Information
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
            {links.map((link) => (
              <li key={link.url + link.label}>
                <Link
                  href={link.url}
                  target={('openInNewTab' in link && link.openInNewTab) ? '_blank' : undefined}
                  rel={('openInNewTab' in link && link.openInNewTab) ? 'noopener noreferrer' : undefined}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support & Contact */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">
            Support
          </h3>
          <p className="text-xs text-zinc-400">
            Assistance with orders, sizing, or tracking:
          </p>
          <div className="space-y-2 text-xs text-zinc-300">
            <a
              href={`mailto:${settings?.email || 'revntrix@gmail.com'}`}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span>{settings?.email || 'revntrix@gmail.com'}</span>
            </a>
            <div className="flex items-center gap-2 text-zinc-400">
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
              <span>Direct WhatsApp Concierge</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-2 flex items-center gap-3">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                Instagram ↗
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                Twitter/X ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-xs gap-4">
        <div>
          © {new Date().getFullYear()} {settings?.brand_name || 'REVNTRIX'}. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">
            Terms of Service
          </Link>
          <Link href="/admin" className="text-zinc-600 hover:text-zinc-400 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
