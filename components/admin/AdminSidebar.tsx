'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  MessageSquareShare,
  Layers,
  Image as ImageIcon,
  LayoutGrid,
  FileText,
  Navigation,
  FolderOpen,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sliders,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  const coreNav = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Designs', href: '/admin/designs', icon: Shirt },
    { label: 'Leads Pipeline', href: '/admin/leads', icon: MessageSquareShare },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
  ];

  const cmsNav = [
    { label: 'Banners Slider', href: '/admin/banners', icon: ImageIcon },
    { label: 'Homepage Sections', href: '/admin/website/home', icon: LayoutGrid },
    { label: 'Content Blocks', href: '/admin/website/content', icon: Sliders },
    { label: 'Navigation Menus', href: '/admin/website/menus', icon: Navigation },
    { label: 'Pages & Markdown', href: '/admin/website/pages', icon: FileText },
    { label: 'Media Library', href: '/admin/website/media', icon: FolderOpen },
  ];

  const settingsNav = [
    { label: 'Settings & Branding', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Failed to log out');
    }
  };

  const renderNavGroup = (title: string, items: typeof coreNav) => (
    <div className="space-y-1">
      <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = 'exact' in item && item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-zinc-950 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  const NavLinks = () => (
    <div className="flex flex-col gap-5 py-4">
      {renderNavGroup('Store Operations', coreNav)}
      {renderNavGroup('Content Management', cmsNav)}
      {renderNavGroup('Configuration', settingsNav)}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-zinc-200">
        <Link href="/admin" className="font-display font-black text-xl tracking-tight text-zinc-900">
          REVNTRIX <span className="text-xs font-mono font-normal text-zinc-500">ADMIN</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-zinc-700 hover:bg-zinc-100 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="w-72 bg-white h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="font-display font-black text-lg text-zinc-900">REVNTRIX</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-zinc-500 hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NavLinks />
            </div>

            <div className="pt-4 border-t border-zinc-200 space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-black rounded-lg hover:bg-zinc-100"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Storefront</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 bg-white min-h-screen p-5 justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          <div className="px-2 pt-1 flex items-center justify-between">
            <Link href="/admin" className="block">
              <span className="font-display font-black text-xl tracking-tight text-zinc-950 block">
                REVNTRIX
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block -mt-1">
                Admin Console
              </span>
            </Link>
          </div>

          <NavLinks />
        </div>

        <div className="pt-4 border-t border-zinc-100 space-y-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 rounded-xl transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              <span>Storefront Preview</span>
            </span>
            <span className="text-[10px] font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">
              Live
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
