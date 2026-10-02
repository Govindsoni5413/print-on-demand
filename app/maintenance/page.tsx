import React from 'react';
import Link from 'next/link';
import { Lock, Clock } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-xl">
          <Clock className="w-8 h-8 text-zinc-200 animate-pulse" />
        </div>

        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">
            Scheduled Maintenance
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-zinc-950">
            REVNTRIX
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-3 leading-relaxed">
            We are performing scheduled updates to our storefront catalog and ordering pipeline. We will be right back shortly.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
          Orders already confirmed on WhatsApp are processing normally without delay.
        </div>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-800 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Staff / Admin Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
