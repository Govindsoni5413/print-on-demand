import React from 'react';
import { BannerForm } from '@/components/admin/BannerForm';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [bannerRes, designsRes, categoriesRes] = await Promise.all([
    supabaseAdmin.from('banners').select('*').eq('id', id).single(),
    supabaseAdmin.from('designs').select('id, title, slug').order('title'),
    supabaseAdmin.from('categories').select('id, name, slug').order('name'),
  ]);

  if (!bannerRes.data) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <BannerForm
        initialData={bannerRes.data}
        designs={designsRes.data || []}
        categories={categoriesRes.data || []}
      />
    </div>
  );
}
