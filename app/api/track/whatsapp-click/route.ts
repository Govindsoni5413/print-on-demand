import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CreateLeadSchema } from '@/lib/validations/lead';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = CreateLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, designId, size, color, source } = validation.data;
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const ipHash = forwardedFor
      ? crypto.createHash('sha256').update(forwardedFor).digest('hex').substring(0, 16)
      : null;

    // Point 5: Server-side check 1: WhatsApp master switch
    const { data: settings } = await supabaseAdmin
      .from('site_settings')
      .select('whatsapp_enabled')
      .eq('id', 'default')
      .single();

    if (settings && settings.whatsapp_enabled === false) {
      return NextResponse.json(
        { error: 'WhatsApp ordering is currently paused by store administration.' },
        { status: 403 }
      );
    }

    // Point 5: Server-side check 2: Sold-out design check
    if (designId) {
      const { data: design } = await supabaseAdmin
        .from('designs')
        .select('is_sold_out')
        .eq('id', designId)
        .single();

      if (design && design.is_sold_out) {
        return NextResponse.json(
          { error: 'This design is currently sold out.' },
          { status: 400 }
        );
      }
    }

    // Call PostgreSQL atomic RPC function
    const { data: leadResult, error: rpcError } = await supabaseAdmin.rpc('create_or_reuse_lead', {
      p_session_id: sessionId,
      p_design_id: designId || null,
      p_size: size || null,
      p_color: color || null,
      p_source: source || 'product_page',
      p_user_agent: userAgent.substring(0, 255),
      p_ip_hash: ipHash,
    });

    if (rpcError) {
      console.error('RPC create_or_reuse_lead error:', rpcError);
      if (rpcError.message?.includes('WhatsApp ordering is currently paused')) {
        return NextResponse.json({ error: rpcError.message }, { status: 403 });
      }
      if (rpcError.message?.includes('sold out')) {
        return NextResponse.json({ error: rpcError.message }, { status: 400 });
      }
      // If database error or rate limit, return graceful default
      return NextResponse.json(
        {
          assigned_whatsapp_number: process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_1 || '917852811695',
          lead_code: 'RVX-DIRECT',
          error: rpcError.message,
        },
        { status: 200 }
      );
    }

    const lead = leadResult && leadResult[0];

    // Log tracking event in background
    try {
      await supabaseAdmin.from('events').insert({
        event_name: 'whatsapp_click',
        session_id: sessionId,
        design_id: designId || null,
        metadata: {
          lead_code: lead?.lead_code,
          assigned_phone: lead?.assigned_whatsapp_number,
          size,
          color,
          source,
          is_reused: lead?.is_reused,
        },
      });
    } catch (e) {
      console.warn('Failed to insert tracking event:', e);
    }

    return NextResponse.json({
      lead_id: lead?.lead_id,
      lead_code: lead?.lead_code,
      assigned_whatsapp_number: lead?.assigned_whatsapp_number,
      is_reused: lead?.is_reused,
    });
  } catch (error: any) {
    console.error('Error in /api/track/whatsapp-click:', error);
    return NextResponse.json(
      {
        assigned_whatsapp_number: process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_1 || '917852811695',
        lead_code: 'RVX-DIRECT',
      },
      { status: 200 }
    );
  }
}
