import React from 'react';
import { BannerForm } from '@/components/admin/BannerForm';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default async function NewBannerPage() {
  const [designsRes, categoriesRes] = await Promise.all([
    supabaseAdmin.from('designs').select('id, title, slug').order('title'),
    supabaseAdmin.from('categories').select('id, name, slug').order('name'),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <BannerForm
        designs={designsRes.data || []}
        categories={categoriesRes.data || []}
      />
    </div>
  );
}
