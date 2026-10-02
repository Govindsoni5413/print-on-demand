import React from 'react';
import { PageEditor } from '@/components/admin/PageEditor';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';

export default async function EditCmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: page } = await supabaseAdmin
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!page) {
    notFound();
  }

  return <PageEditor initialData={page} />;
}
