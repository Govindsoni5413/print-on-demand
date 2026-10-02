import { getSessionId, cleanPhone } from './utils';

export interface WhatsAppOrderParams {
  designId?: string | null;
  designTitle?: string;
  size?: string | null;
  color?: string | null;
  price?: number;
  source?: 'product_page' | 'floating_button' | 'hero_cta' | 'direct';
}

const DEFAULT_PHONE = process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP_1 || '917852811695';

/**
 * Point 3 & 4:
 * 1. Calls API with session ID + specs to atomically pick number & log/reuse lead.
 * 2. 2-second timeout fallback: never blocks customer if server is slow.
 * 3. Uses window.location.assign(waUrl) in SAME tab so mobile browser does not block popup.
 */
export async function handleWhatsAppRedirect(params: WhatsAppOrderParams = {}): Promise<void> {
  const sessionId = getSessionId();
  const source = params.source || (params.designId ? 'product_page' : 'floating_button');

  let assignedPhone = DEFAULT_PHONE;
  let leadCode = 'RVX-DIRECT';

  // 2s timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch('/api/track/whatsapp-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        designId: params.designId || null,
        size: params.size || null,
        color: params.color || null,
        source,
        designTitle: params.designTitle,
        price: params.price,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) {
        if (typeof window !== 'undefined') {
          alert(errData.error);
        }
        return;
      }
    }

    if (res.ok) {
      const data = await res.json();
      if (data.assigned_whatsapp_number) {
        assignedPhone = cleanPhone(data.assigned_whatsapp_number);
      }
      if (data.lead_code) {
        leadCode = data.lead_code;
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn('WhatsApp tracking timed out (2s limit), falling back to default number');
    } else {
      console.warn('WhatsApp tracking fallback triggered:', err);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  // Build prefilled message
  let text = '';
  if (params.designTitle) {
    text = `Hi REVNTRIX! I want to order this t-shirt:\n\n• Ref: ${leadCode}\n• Design: ${params.designTitle}\n• Size: ${params.size || 'M'}\n• Color: ${params.color || 'Onyx Black'}\n• Price: ₹${params.price || 899}\n\nPlease share payment and delivery details!`;
  } else {
    text = `Hi REVNTRIX! I have a question about your t-shirt drops.\n\n• Ref: ${leadCode}\nPlease share your latest catalog and ordering process.`;
  }

  const cleanNum = cleanPhone(assignedPhone);
  const waUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;

  // Navigate in the same tab as required by Point 3
  if (typeof window !== 'undefined') {
    window.location.assign(waUrl);
  }
}
