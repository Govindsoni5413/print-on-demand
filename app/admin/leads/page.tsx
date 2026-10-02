'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatINR, formatDate, cleanPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Search,
  ExternalLink,
  MessageSquareShare,
  Edit3,
  Check,
  X,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  'new',
  'contacted',
  'confirmed',
  'paid',
  'printing',
  'shipped',
  'delivered',
  'cancelled',
  'spam',
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingLead, setEditingLead] = useState<any | null>(null);

  const supabase = createClient();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*, designs(title, slug, price)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setLeads(data);
    } catch (err: any) {
      toast.error('Failed to load leads: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (error) throw error;
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const saveLeadDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          customer_name: editingLead.customer_name,
          customer_phone: editingLead.customer_phone,
          shipping_address: editingLead.shipping_address,
          cost_price: Number(editingLead.cost_price || 0),
          sale_price: Number(editingLead.sale_price || 0),
          printer_notes: editingLead.printer_notes,
          status: editingLead.status,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', editingLead.id);

      if (error) throw error;

      setLeads((prev) =>
        prev.map((l) => (l.id === editingLead.id ? { ...l, ...editingLead } : l))
      );
      setEditingLead(null);
      toast.success('Lead updated successfully');
    } catch (err: any) {
      toast.error('Failed to update lead: ' + err.message);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const s = search.toLowerCase();
    return (
      l.lead_code?.toLowerCase().includes(s) ||
      l.customer_name?.toLowerCase().includes(s) ||
      l.customer_phone?.toLowerCase().includes(s) ||
      l.designs?.title?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-zinc-900 tracking-tight">
            WhatsApp Leads Pipeline
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Single source of truth for chat orders, printing dispatch &amp; fulfillment
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchLeads} isLoading={loading}>
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Pipeline
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by RVX code, customer name or phone..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 capitalize"
          >
            <option value="all">All Lead Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st} className="capitalize">
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-16 text-center text-zinc-400 text-xs">
            <MessageSquareShare className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            No leads matching current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-3.5">Ref Code</th>
                  <th className="px-6 py-3.5">Design &amp; Variant</th>
                  <th className="px-6 py-3.5">Customer &amp; Phone</th>
                  <th className="px-6 py-3.5">Assigned Line</th>
                  <th className="px-6 py-3.5">Profit Calc</th>
                  <th className="px-6 py-3.5">Pipeline Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {filteredLeads.map((lead) => {
                  const sale = Number(lead.sale_price || 0);
                  const cost = Number(lead.cost_price || 0);
                  const profit = sale - cost;

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-zinc-900 block">
                          {lead.lead_code}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatDate(lead.created_at)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-800">
                          {lead.designs?.title || 'Direct Chat Inquiry'}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          Size: <span className="font-semibold text-zinc-700">{lead.size || '-'}</span> • Color:{' '}
                          <span className="font-semibold text-zinc-700">{lead.color || '-'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-zinc-900 font-semibold">
                          {lead.customer_name || <span className="text-zinc-400 italic">Pending WhatsApp</span>}
                        </div>
                        {lead.customer_phone && (
                          <div className="font-mono text-zinc-500 text-[11px]">
                            {lead.customer_phone}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-zinc-700">
                          <PhoneCall className="w-3 h-3 text-emerald-600" />
                          {lead.assigned_whatsapp_number}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          Sale: <span className="font-semibold text-zinc-900">{formatINR(sale)}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Cost: {formatINR(cost)} |{' '}
                          <span
                            className={
                              profit >= 0
                                ? 'text-emerald-600 font-semibold'
                                : 'text-rose-600 font-semibold'
                            }
                          >
                            Net: {formatINR(profit)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold capitalize focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="capitalize">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                            title="Edit Lead & Shipping Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <Link
                            href={`https://wa.me/${cleanPhone(lead.assigned_whatsapp_number)}?text=${encodeURIComponent(
                              `Hi, regarding order Ref ${lead.lead_code}...`
                            )}`}
                            target="_blank"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50"
                            title="Open WhatsApp Chat"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Update Lead {editingLead.lead_code}
                </h3>
                <p className="text-xs text-zinc-500">Record customer details and supplier printing notes</p>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveLeadDetails} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editingLead.customer_name || ''}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, customer_name: e.target.value })
                    }
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={editingLead.customer_phone || ''}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, customer_phone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Shipping Address</label>
                <textarea
                  rows={2}
                  value={editingLead.shipping_address || ''}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, shipping_address: e.target.value })
                  }
                  placeholder="Street, City, State, PIN..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    value={editingLead.sale_price || ''}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, sale_price: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Cost / Printer Price (₹)</label>
                  <input
                    type="number"
                    value={editingLead.cost_price || ''}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, cost_price: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Printer / Dispatch Notes</label>
                <textarea
                  rows={2}
                  value={editingLead.printer_notes || ''}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, printer_notes: e.target.value })
                  }
                  placeholder="Sent graphic to vendor, tracking ID..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLead(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  <Check className="w-3.5 h-3.5 mr-1" /> Save Details
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
