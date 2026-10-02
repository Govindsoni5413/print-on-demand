'use client';

import React, { useState, useEffect } from 'react';
import { MediaUploader } from '@/components/admin/MediaUploader';
import {
  FolderOpen,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  name: string;
  size?: number;
  mimetype?: string;
  createdAt?: string;
  url: string;
  path: string;
}

export default function AdminMediaLibraryPage() {
  const [activeFolder, setActiveFolder] = useState('banners');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media/list?folder=${activeFolder}`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files || []);
      } else {
        toast.error(data.error || 'Failed to list media');
      }
    } catch {
      toast.error('Network error loading media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [activeFolder]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('Asset URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.name}"? If this image is currently used in banners or settings, it will break.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path }),
      });

      if (res.ok) {
        toast.success('Image deleted from storage');
        loadFiles();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting file');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-zinc-950 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-zinc-800" />
            <span>Media Library</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Storage bucket browser for banner drops, branding assets, and promotional media. Max 5MB per file.
          </p>
        </div>

        <button
          onClick={loadFiles}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
          Upload to &quot;{activeFolder}&quot; folder
        </h2>
        <MediaUploader
          onChange={(url) => {
            if (url) {
              loadFiles();
            }
          }}
          folder={activeFolder}
          label=""
          helpText="Supported formats: JPEG, PNG, WebP, SVG, GIF (max 5MB)"
        />
      </div>

      {/* Folder Filter Tabs */}
      <div className="flex gap-2 bg-zinc-100 p-1.5 rounded-2xl w-fit">
        {['banners', 'branding', 'uploads'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFolder(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
              activeFolder === f
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 font-mono">
          Loading files in /{activeFolder}...
        </div>
      ) : files.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-2">
          <p className="text-sm font-semibold text-zinc-800">Folder is empty</p>
          <p className="text-xs text-zinc-500">
            Upload an image above to populate assets in /{activeFolder}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => {
            const isCopied = copiedUrl === file.url;
            return (
              <div
                key={file.id || file.path}
                className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:border-zinc-300 transition flex flex-col justify-between"
              >
                {/* Image Preview */}
                <div className="aspect-square w-full bg-zinc-100 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/90 hover:bg-white text-zinc-900 rounded-lg transition"
                      title="Open full image"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(file.url)}
                      className="p-2 bg-white/90 hover:bg-white text-zinc-900 rounded-lg transition"
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(file)}
                      className="p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-lg transition"
                      title="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 border-t border-zinc-100 space-y-1">
                  <p className="text-[11px] font-mono text-zinc-800 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>{file.size ? `${Math.round(file.size / 1024)} KB` : ''}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(file.url)}
                      className="text-zinc-600 hover:text-black font-semibold flex items-center gap-1"
                    >
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
