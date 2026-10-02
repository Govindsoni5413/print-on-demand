import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: isAdmin, error: authError } = await supabase.rpc('is_admin');

    if (authError || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folder = req.nextUrl.searchParams.get('folder') || 'banners';

    const { data: files, error } = await supabaseAdmin.storage
      .from('site-media')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (files || [])
      .filter((f) => f.name !== '.emptyFolderPlaceholder')
      .map((f) => {
        const { data: pubData } = supabaseAdmin.storage
          .from('site-media')
          .getPublicUrl(`${folder}/${f.name}`);

        return {
          id: f.id,
          name: f.name,
          size: f.metadata?.size,
          mimetype: f.metadata?.mimetype,
          createdAt: f.created_at,
          url: pubData.publicUrl,
          path: `${folder}/${f.name}`,
        };
      });

    return NextResponse.json({ files: items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
