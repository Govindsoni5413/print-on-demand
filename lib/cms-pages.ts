import { supabaseAdmin } from '@/lib/supabase/admin';
import { Page } from '@/types/database';

export async function getCmsPage(slug: string): Promise<Page | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) return null;
    return data as Page;
  } catch {
    return null;
  }
}
