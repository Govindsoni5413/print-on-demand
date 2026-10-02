import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Verify authenticated user is admin
    const { data: isAdmin, error: authError } = await supabase.rpc('is_admin');
    if (authError || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin credentials required for cache revalidation' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { paths = ['/'], tags = [], isLayout = false } = body;

    const revalidated: string[] = [];

    if (isLayout) {
      revalidatePath('/', 'layout');
      revalidated.push('/ (layout)');
    }

    for (const p of paths) {
      revalidatePath(p);
      if (!revalidated.includes(p)) {
        revalidated.push(p);
      }
    }

    for (const t of tags) {
      try {
        revalidateTag(t);
        revalidated.push(`tag:${t}`);
      } catch (e) {
        console.warn('Tag revalidate error:', e);
      }
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Revalidation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to revalidate' },
      { status: 500 }
    );
  }
}
