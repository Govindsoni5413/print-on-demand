'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeGuideData?: {
    note?: string;
    sizes?: { size: string; chest: string; length: string }[];
  };
}

export function SizeGuideModal({ isOpen, onClose, sizeGuideData }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const defaultSizes = [
    { size: 'S', chest: '38 in', length: '27 in' },
    { size: 'M', chest: '40 in', length: '28 in' },
    { size: 'L', chest: '42 in', length: '29 in' },
    { size: 'XL', chest: '44 in', length: '30 in' },
    { size: 'XXL', chest: '46 in', length: '31 in' },
  ];

  const sizes = sizeGuideData?.sizes || defaultSizes;
  const note =
    sizeGuideData?.note ||
    'Regular unisex streetwear fit. Order your standard t-shirt size, or size up for an oversized streetwear drape.';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200 max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100"
          aria-label="Close size guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-5 h-5 text-zinc-900" />
          <h2 className="text-base font-bold font-display text-zinc-900">
            Size &amp; Fit Guide
          </h2>
        </div>

        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
          {note}
        </p>

        <div className="rounded-2xl border border-zinc-200 overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Chest (Circumference)</th>
                <th className="px-4 py-3">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sizes.map((row) => (
                <tr key={row.size} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-bold text-zinc-900">{row.size}</td>
                  <td className="px-4 py-2.5 text-zinc-600 font-mono">{row.chest}</td>
                  <td className="px-4 py-2.5 text-zinc-600 font-mono">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-zinc-50 rounded-xl text-[11px] text-zinc-500">
          💡 <strong>Tip:</strong> Need sizing advice? You can also ask directly on WhatsApp before your order is printed.
        </div>
      </div>
    </div>
  );
}
