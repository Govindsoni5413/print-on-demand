'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DesignForm } from '@/components/admin/DesignForm';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditDesignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [design, setDesign] = useState<any>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [catRes, designRes] = await Promise.all([
          supabase.from('categories').select('id, name').order('name'),
          supabase.from('designs').select('*').eq('id', id).single(),
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (designRes.data) {
          setDesign(designRes.data);
        } else {
          toast.error('Design not found');
          router.push('/admin/designs');
        }
      } catch (err) {
        console.error('Failed to load design:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-zinc-900 tracking-tight">
          Edit Design: {design?.title}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Modify product specifications, colorways and 3D decal placement
        </p>
      </div>

      <DesignForm initialData={design} categories={categories} />
    </div>
  );
}
