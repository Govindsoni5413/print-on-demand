'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { ContentBlock } from '@/types/database';
import {
  Sliders,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  HelpCircle,
  Sparkles,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

type BlockType = 'how_it_works' | 'why_revntrix' | 'faq' | 'review';

export default function AdminContentBlocksPage() {
  const [activeTab, setActiveTab] = useState<BlockType>('why_revntrix');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Partial<ContentBlock> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const loadBlocks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) setBlocks(data as ContentBlock[]);
    } catch (err: any) {
      toast.error('Failed to load content blocks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const filteredBlocks = blocks.filter((b) => b.type === activeTab);

  const openNewModal = () => {
    setEditingBlock({
      type: activeTab,
      title: '',
      subtitle: '',
      content: '',
      sort_order: filteredBlocks.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (block: ContentBlock) => {
    setEditingBlock(block);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock?.title || !editingBlock?.content) {
      toast.error('Title and Content are required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBlock.id) {
        const { error } = await (supabase as any)
          .from('content_blocks')
          .update({
            title: editingBlock.title,
            subtitle: editingBlock.subtitle || null,
            content: editingBlock.content,
            sort_order: Number(editingBlock.sort_order),
            is_active: editingBlock.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBlock.id);

        if (error) throw error;
        toast.success('Block updated');
      } else {
        const { error } = await (supabase as any).from('content_blocks').insert({
          type: editingBlock.type,
          title: editingBlock.title,
          subtitle: editingBlock.subtitle || null,
          content: editingBlock.content,
          sort_order: Number(editingBlock.sort_order),
          is_active: editingBlock.is_active ?? true,
        });

        if (error) throw error;
        toast.success('Block created');
      }

      await triggerRevalidation(['/'], false, '/');
      setModalOpen(false);
      loadBlocks();
    } catch (err: any) {
      toast.error('Error saving block: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this block?')) return;
    try {
      const { error } = await (supabase as any)
        .from('content_blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Block removed');
      await triggerRevalidation(['/'], false);
      loadBlocks();
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const tabs = [
    { key: 'why_revntrix', label: 'Why Revntrix', icon: Sparkles, desc: 'Value propositions & core standards' },
    { key: 'how_it_works', label: 'How It Works', icon: Layers, desc: 'Step-by-step ordering workflow' },
    { key: 'faq', label: 'FAQs', icon: HelpCircle, desc: 'Common questions on orders & sizing' },
    { key: 'review', label: 'Reviews', icon: MessageSquare, desc: 'Real customer feedback' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-zinc-950 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-zinc-800" />
            <span>Storefront Content Blocks</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Customize informational copy, Why Revntrix standards, How It Works steps, and FAQs.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Block</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-100 p-1.5 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as BlockType)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-black hover:bg-white/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Blocks List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 font-mono">
          Loading content blocks...
        </div>
      ) : filteredBlocks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
          <p className="text-sm font-semibold text-zinc-800">No blocks found in this section</p>
          <p className="text-xs text-zinc-500">
            Click &quot;Add Block&quot; to populate items for {activeTab}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredBlocks.map((block) => (
            <div
              key={block.id}
              className={`p-5 rounded-2xl border transition bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                block.is_active ? 'border-zinc-200' : 'border-zinc-200/60 opacity-60'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-zinc-400">
                    #{block.sort_order}
                  </span>
                  <h3 className="font-display font-bold text-sm text-zinc-950">
                    {block.title}
                  </h3>
                  {block.subtitle && (
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded">
                      {block.subtitle}
                    </span>
                  )}
                  {!block.is_active && (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 pt-1 leading-relaxed">
                  {block.content}
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(block)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(block.id)}
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

      {/* Edit / New Modal */}
      {modalOpen && editingBlock && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-display font-bold text-base text-zinc-950">
                {editingBlock.id ? 'Edit Content Block' : 'New Content Block'}
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
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingBlock.title || ''}
                  onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                  placeholder="e.g. Printed to order"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={editingBlock.subtitle || ''}
                  onChange={(e) => setEditingBlock({ ...editingBlock, subtitle: e.target.value })}
                  placeholder="e.g. Zero deadstock"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Content / Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingBlock.content || ''}
                  onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                  placeholder="Body copy..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingBlock.sort_order ?? 1}
                    onChange={(e) => setEditingBlock({ ...editingBlock, sort_order: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_active_block"
                    checked={editingBlock.is_active ?? true}
                    onChange={(e) => setEditingBlock({ ...editingBlock, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-zinc-900 accent-zinc-900"
                  />
                  <label htmlFor="is_active_block" className="text-xs font-bold text-zinc-800 cursor-pointer">
                    Active
                  </label>
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
                  {submitting ? 'Saving...' : 'Save Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
