'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DesignForm } from '@/components/admin/DesignForm';

export default function NewDesignPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-zinc-900 tracking-tight">
          Create New T-Shirt Design
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Upload artwork, configure pricing &amp; preview on real 3D t-shirt model
        </p>
      </div>

      <DesignForm categories={categories} />
    </div>
  );
}
