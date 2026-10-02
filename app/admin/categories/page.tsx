'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Layers, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const supabase = createClient();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) setCategories(data);
    } catch (err: any) {
      toast.error('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder(categories.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setSortOrder(cat.sort_order || 0);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name,
            slug,
            description,
            sort_order: sortOrder,
          } as any)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase.from('categories').insert({
          name,
          slug,
          description,
          sort_order: sortOrder,
        } as any);

        if (error) throw error;
        toast.success('Category created');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error('Failed to save category: ' + err.message);
    }
  };

  const deleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Linked designs will become uncategorized.`)) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: any) {
      toast.error('Failed to delete category: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-zinc-900 tracking-tight">
            Categories Manager
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Organize drops and storefront navigation taxonomies
          </p>
        </div>

        <Button size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-16 text-center text-zinc-400 text-xs">
            <Layers className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            No categories created yet. Click above to add your first category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-400">
                      #{cat.sort_order}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-500 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 max-w-xs truncate">
                      {cat.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id, cat.name)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cyberpunk & Anime"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="cyberpunk-anime"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short taxonomy summary..."
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
