import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { eventName, event_name, eventType, event_type, sessionId, session_id, designId, design_id, bannerId, banner_id, path, metadata } = await req.json();

    const actualEventName = eventName || event_name || eventType || event_type;
    const actualSessionId = sessionId || session_id || 'anonymous';
    const actualBannerId = bannerId || banner_id || null;
    const actualDesignId = designId || design_id || null;

    if (!actualEventName) {
      return NextResponse.json({ error: 'Missing required eventName' }, { status: 400 });
    }

    await supabaseAdmin.from('events').insert({
      event_name: actualEventName,
      event_type: actualEventName,
      session_id: actualSessionId,
      design_id: actualDesignId,
      banner_id: actualBannerId,
      path: path || null,
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.warn('View tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
