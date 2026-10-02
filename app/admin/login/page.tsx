'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('revntrix@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error('Authentication failed: ' + error.message);
        return;
      }

      if (data?.user) {
        toast.success('Signed in successfully');
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 text-white mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-zinc-900">
            REVNTRIX Admin
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Sign in to manage catalog, orders & settings
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-700">
              <span className="font-semibold block mb-0.5">Access Denied</span>
              {errorMsg}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="revntrix@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-2">
            Sign In to Dashboard
          </Button>
        </form>

        {/* Setup Instructions Box (Point 5) */}
        <div className="mt-8 pt-6 border-t border-zinc-100">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            First Time Setup
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed mb-3">
            1. Create the user <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">revntrix@gmail.com</code> in your Supabase Auth dashboard.<br />
            2. Run this SQL in Supabase SQL editor:
          </p>
          <pre className="text-[11px] bg-zinc-900 text-zinc-100 p-3 rounded-xl overflow-x-auto select-all">
{`INSERT INTO public.admins (email, role)
VALUES ('revntrix@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
