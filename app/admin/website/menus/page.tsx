'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { MenuItem } from '@/types/database';
import {
  Navigation,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ArrowUpDown,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

type MenuLocation = 'header' | 'footer';

export default function AdminMenusPage() {
  const [activeLocation, setActiveLocation] = useState<MenuLocation>('header');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) setItems(data as MenuItem[]);
    } catch (err: any) {
      toast.error('Failed to load menu items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((i) => i.location === activeLocation);

  const openNewModal = () => {
    setEditingItem({
      location: activeLocation,
      label: '',
      url: '/',
      sort_order: filteredItems.length + 1,
      is_active: true,
      open_in_new_tab: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.label || !editingItem?.url) {
      toast.error('Label and URL are required');
      return;
    }

    // Safety: ensure relative or https URL
    const url = editingItem.url.trim();
    if (!url.startsWith('/') && !url.startsWith('https://')) {
      toast.error('Link must be a relative path starting with "/" or an external "https://" URL.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem.id) {
        const { error } = await (supabase as any)
          .from('menu_items')
          .update({
            label: editingItem.label,
            url: editingItem.url,
            sort_order: Number(editingItem.sort_order),
            is_active: editingItem.is_active,
            open_in_new_tab: editingItem.open_in_new_tab,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Menu item updated');
      } else {
        const { error } = await (supabase as any).from('menu_items').insert({
          location: editingItem.location,
          label: editingItem.label,
          url: editingItem.url,
          sort_order: Number(editingItem.sort_order),
          is_active: editingItem.is_active ?? true,
          open_in_new_tab: editingItem.open_in_new_tab ?? false,
        });

        if (error) throw error;
        toast.success('Menu item added');
      }

      // Point 7: Revalidate layout so Header/Footer update everywhere
      await triggerRevalidation(['/'], true, '/');
      setModalOpen(false);
      loadItems();
    } catch (err: any) {
      toast.error('Error saving menu item: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu link?')) return;
    try {
      const { error } = await (supabase as any)
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Menu link removed');
      await triggerRevalidation(['/'], true);
      loadItems();
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-zinc-950 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-zinc-800" />
            <span>Navigation Menus</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage links displayed in the Header navbar and Footer information columns.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Link</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-zinc-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveLocation('header')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeLocation === 'header'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          Header Navigation
        </button>
        <button
          onClick={() => setActiveLocation('footer')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
            activeLocation === 'footer'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          Footer Navigation
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 font-mono">
          Loading navigation links...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
          <p className="text-sm font-semibold text-zinc-800">No links in this menu</p>
          <p className="text-xs text-zinc-500">
            Click &quot;Add Menu Link&quot; to configure links for {activeLocation}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition bg-white flex items-center justify-between gap-4 ${
                item.is_active ? 'border-zinc-200' : 'border-zinc-200/60 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono text-xs font-bold text-zinc-400 w-6">
                  #{item.sort_order}
                </span>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950">{item.label}</span>
                    {item.open_in_new_tab && (
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ExternalLink className="w-2.5 h-2.5" /> New Tab
                      </span>
                    )}
                    {!item.is_active && (
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono truncate">{item.url}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-display font-bold text-base text-zinc-950">
                {editingItem.id ? 'Edit Menu Link' : 'Add Menu Link'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Location
                </label>
                <select
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value as any })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 font-semibold bg-zinc-50"
                >
                  <option value="header">Header Navbar</option>
                  <option value="footer">Footer Navigation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Link Label
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.label || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  placeholder="e.g. Shop All or Shipping & Returns"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="e.g. /shop or https://..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.sort_order ?? 1}
                    onChange={(e) => setEditingItem({ ...editingItem, sort_order: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                  />
                </div>

                <div className="space-y-2 pt-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="menu_is_active"
                      checked={editingItem.is_active ?? true}
                      onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-zinc-900 accent-zinc-900"
                    />
                    <label htmlFor="menu_is_active" className="text-xs font-bold text-zinc-800 cursor-pointer">
                      Visible
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="menu_new_tab"
                      checked={editingItem.open_in_new_tab ?? false}
                      onChange={(e) => setEditingItem({ ...editingItem, open_in_new_tab: e.target.checked })}
                      className="w-4 h-4 rounded text-zinc-900 accent-zinc-900"
                    />
                    <label htmlFor="menu_new_tab" className="text-xs font-bold text-zinc-800 cursor-pointer">
                      Open New Tab
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
