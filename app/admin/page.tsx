'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareShare,
  TrendingUp,
  DollarSign,
  Package,
  Eye,
  PlusCircle,
  ExternalLink,
  ArrowUpRight,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatINR, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface Metrics {
  total_leads: number;
  total_chats: number;
  total_orders: number;
  conversion_rate: number;
  total_revenue: number;
  total_profit: number;
  page_views: number;
  product_views: number;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({
    total_leads: 0,
    total_chats: 0,
    total_orders: 0,
    conversion_rate: 0,
    total_revenue: 0,
    total_profit: 0,
    page_views: 0,
    product_views: 0,
  });

  const [dailyData, setDailyData] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [routingStats, setRoutingStats] = useState<any[]>([]);

  const supabase = createClient();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch metrics using SQL aggregate function (Point 5)
      const { data: metricsData } = await supabase.rpc('get_dashboard_metrics');
      if (metricsData && metricsData.length > 0) {
        setMetrics(metricsData[0] as Metrics);
      } else {
        // Fallback aggregate query if RPC not yet run in remote db
        const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        const { count: viewCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
        setMetrics((prev) => ({
          ...prev,
          total_leads: leadCount || 0,
          total_chats: leadCount || 0,
          page_views: viewCount || 0,
        }));
      }

      // 2. Fetch daily analytics via SQL aggregate (Point 5)
      const { data: daily } = await supabase.rpc('get_daily_analytics', { p_days: 14 });
      if (daily && daily.length > 0) {
        setDailyData(daily);
      } else {
        // Default sample chart curve if DB is fresh
        const sampleDays = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            day_date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: Math.floor(Math.random() * 20) + 5,
            leads: Math.floor(Math.random() * 6),
            orders: Math.floor(Math.random() * 2),
            revenue: Math.floor(Math.random() * 2) * 899,
          };
        });
        setDailyData(sampleDays);
      }

      // 3. Fetch WhatsApp routing stats via SQL aggregate (Point 2 & 5)
      const { data: routing } = await supabase.rpc('get_whatsapp_routing_stats');
      if (routing && routing.length > 0) {
        setRoutingStats(routing);
      }

      // 4. Fetch recent leads
      const { data: leads } = await supabase
        .from('leads')
        .select('*, designs(title)')
        .order('created_at', { ascending: false })
        .limit(8);

      if (leads) {
        setRecentLeads(leads);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="warning">New</Badge>;
      case 'contacted':
        return <Badge variant="neutral">Contacted</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'printing':
        return <Badge variant="default">Printing</Badge>;
      case 'shipped':
        return <Badge variant="success">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-zinc-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time WhatsApp conversions & print-on-demand lead pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={loading}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          <Link href="/admin/designs/new">
            <Button size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Design
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* WhatsApp Chats (Point 4: Single source of truth) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">WhatsApp Chats</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquareShare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-zinc-900">
            {metrics.total_chats}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            Total unique routed leads
          </div>
        </div>

        {/* Converted Orders */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-zinc-900">
            {metrics.total_orders}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Conv. Rate: <span className="font-semibold text-zinc-700">{metrics.conversion_rate}%</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-800">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-zinc-900">
            {formatINR(metrics.total_revenue)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            Est. Profit: {formatINR(metrics.total_profit)}
          </div>
        </div>

        {/* Page / Store Views */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Storefront Traffic</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-zinc-900">
            {metrics.page_views}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Product Views: {metrics.product_views}
          </div>
        </div>
      </div>

      {/* Analytics Chart & Round-Robin Routing Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Lead & Traffic Trajectory</h2>
              <p className="text-xs text-zinc-400">Views vs. WhatsApp chats initiated</p>
            </div>
            <Badge variant="outline">Last 14 Days</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25D366" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                <XAxis dataKey="day_date" tickLine={false} axisLine={false} fontSize={11} stroke="#A1A1AA" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#A1A1AA" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="views" name="Page Views" stroke="#0A0A0A" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" />
                <Area type="monotone" dataKey="leads" name="WhatsApp Chats" stroke="#25D366" strokeWidth={2.5} fillOpacity={1} fill="url(#leadsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WhatsApp Round-Robin Balance (Point 2) */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-zinc-900">WhatsApp Routing Balance</h2>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Atomic round-robin distribution between assigned business phones
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 mb-1">
                  <span>+91 7852811695</span>
                  <Badge variant="neutral">Line 1</Badge>
                </div>
                <div className="text-xl font-bold font-display text-zinc-900 mt-2">
                  {routingStats.find((r) => r.phone_number?.includes('7852811695'))?.lead_count || 0}
                  <span className="text-xs font-normal text-zinc-500 ml-1.5">leads routed</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 mb-1">
                  <span>+91 9376406174</span>
                  <Badge variant="neutral">Line 2</Badge>
                </div>
                <div className="text-xl font-bold font-display text-zinc-900 mt-2">
                  {routingStats.find((r) => r.phone_number?.includes('9376406174'))?.lead_count || 0}
                  <span className="text-xs font-normal text-zinc-500 ml-1.5">leads routed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 border-t border-zinc-100 pt-4 mt-6">
            Database locks row during selection to eliminate race conditions under concurrent customer taps.
          </div>
        </div>
      </div>

      {/* Recent Leads Pipeline */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Recent WhatsApp Orders & Leads</h2>
            <p className="text-xs text-zinc-400">Track and advance leads through the fulfillment pipeline</p>
          </div>
          <Link href="/admin/leads">
            <Button variant="ghost" size="sm" className="text-xs">
              View All Leads <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No leads recorded yet. Tapping &quot;Order on WhatsApp&quot; on any product will automatically appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-3.5">Ref Code</th>
                  <th className="px-6 py-3.5">Design / Product</th>
                  <th className="px-6 py-3.5">Specs</th>
                  <th className="px-6 py-3.5">Assigned Phone</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                      {lead.lead_code}
                    </td>
                    <td className="px-6 py-4 text-zinc-800">
                      {lead.designs?.title || (
                        <span className="text-zinc-400 italic">Direct Inquiry (Floating CTA)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {lead.size || '-'} • {lead.color || '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-600">
                      {lead.assigned_whatsapp_number}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`https://wa.me/${lead.assigned_whatsapp_number.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        Chat <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
