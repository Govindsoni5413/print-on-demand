'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { validateImageUpload, MAX_IMAGE_SIZE_BYTES } from '@/lib/validations/cms';
import { toast } from 'sonner';

interface MediaUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  helpText?: string;
}

export function MediaUploader({
  value,
  onChange,
  folder = 'uploads',
  label = 'Upload Image',
  helpText = 'JPEG, PNG, WebP, SVG up to 5MB',
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation: 5MB + format check
    const validation = validateImageUpload(file);
    if (!validation.valid) {
      toast.error(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">{label}</label>}

      {value ? (
        <div className="relative group border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 p-2 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-14 h-14 rounded-lg bg-zinc-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200">
              <img src={value} alt="Preview" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono text-zinc-800 truncate max-w-[200px]">{value}</p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 font-medium transition"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl p-6 text-center cursor-pointer transition bg-zinc-50/50 hover:bg-zinc-50 ${
            uploading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
              <p className="text-xs text-zinc-600 font-medium">Uploading & optimizing...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 mb-1">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-zinc-900">Click to upload image</p>
              <p className="text-[11px] text-zinc-500">{helpText}</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
