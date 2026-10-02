-- REVNTRIX CMS & Banner Slider Migration
-- 002_cms.sql
-- Idempotent: completely safe to run on an existing database where 001_init.sql is applied, and twice in a row.

-- 1. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT,
    link_type TEXT NOT NULL DEFAULT 'none', -- 'none' | 'design' | 'category' | 'shop' | 'whatsapp' | 'custom'
    link_target TEXT,                        -- design_id / category_id / custom URL
    desktop_image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    text_mode TEXT NOT NULL DEFAULT 'overlay', -- 'overlay' | 'image_only'
    text_align TEXT NOT NULL DEFAULT 'left',   -- 'left' | 'center' | 'right'
    text_color TEXT NOT NULL DEFAULT 'light',  -- 'light' | 'dark'
    overlay_opacity INT NOT NULL DEFAULT 30,  -- 0 to 70
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_active_sort ON public.banners (is_active, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_banners_schedule ON public.banners (start_at, end_at);

-- 2. HOMEPAGE SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.home_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_sections_sort ON public.home_sections (sort_order ASC);

-- 3. CONTENT BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'how_it_works' | 'why_revntrix' | 'faq' | 'testimonial'
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    icon TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_type ON public.content_blocks (type, sort_order ASC);

-- 4. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT NOT NULL, -- 'header' | 'footer'
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    open_in_new_tab BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_loc_sort ON public.menu_items (location, sort_order ASC);

-- 5. PAGES TABLE
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL, -- 'about', 'contact', 'shipping-and-returns', 'privacy', 'terms', 'faq'
    title TEXT NOT NULL,
    content TEXT NOT NULL,     -- Markdown format
    seo_title TEXT,
    seo_description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages (slug);

-- 6. EXTEND SITE_SETTINGS (Point 4: Remove hero_mode, keep banner settings)
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS banner_autoplay_ms INT DEFAULT 5000,
ADD COLUMN IF NOT EXISTS banner_transition TEXT DEFAULT 'fade',
ADD COLUMN IF NOT EXISTS banner_autoplay_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT,
ADD COLUMN IF NOT EXISTS announcement_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS announcement_link TEXT,
ADD COLUMN IF NOT EXISTS announcement_start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS announcement_end_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"instagram":"","twitter":"","whatsapp":""}'::jsonb,
ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'Printed to order, delivered across India.',
ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'REVNTRIX | Premium Streetwear T-Shirts',
ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Printed to order, delivered across India. Interactive 3D visualization and direct WhatsApp ordering.';

-- 7. EXTEND DESIGNS WITH IS_SOLD_OUT
ALTER TABLE public.designs
ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN NOT NULL DEFAULT FALSE;

-- 8. EXTEND EVENTS WITH BANNER_ID (Point 1)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS banner_id UUID REFERENCES public.banners(id) ON DELETE SET NULL;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS event_type TEXT;

CREATE INDEX IF NOT EXISTS idx_events_banner_id ON public.events(banner_id);

DO $$
BEGIN
    -- If a CHECK constraint exists on event_type, ensure banner_click is allowed
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.events'::regclass 
          AND conname = 'events_event_type_check'
    ) THEN
        ALTER TABLE public.events DROP CONSTRAINT events_event_type_check;
    END IF;
END $$;

-- 9. BANNER CLICK AGGREGATE FUNCTION (Uses only event_type = 'banner_click' and banner_id)
CREATE OR REPLACE FUNCTION public.get_banner_click_stats()
RETURNS TABLE (
    banner_id UUID,
    click_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    banner_id,
    COUNT(*) AS click_count
  FROM public.events
  WHERE event_type = 'banner_click'
    AND banner_id IS NOT NULL
  GROUP BY banner_id;
$$;

-- 10. SERVER-SIDE ENFORCEMENT IN CREATE_OR_REUSE_LEAD (Point 5)
CREATE OR REPLACE FUNCTION public.create_or_reuse_lead(
    p_session_id TEXT,
    p_design_id UUID DEFAULT NULL,
    p_size TEXT DEFAULT NULL,
    p_color TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'product_page',
    p_user_agent TEXT DEFAULT NULL,
    p_ip_hash TEXT DEFAULT NULL
)
RETURNS TABLE (
    lead_id UUID,
    lead_code TEXT,
    assigned_whatsapp_number TEXT,
    is_reused BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_recent_leads_count INT;
    v_existing_lead RECORD;
    v_next_number TEXT;
    v_numbers JSONB;
    v_next_idx INT;
    v_num_count INT;
    v_new_lead_id UUID;
    v_new_lead_code TEXT;
    v_design_price NUMERIC := 0;
    v_whatsapp_enabled BOOLEAN := TRUE;
    v_is_sold_out BOOLEAN := FALSE;
BEGIN
    -- Point 5 Server-Side Check 1: WhatsApp Master Switch
    SELECT whatsapp_enabled INTO v_whatsapp_enabled FROM public.site_settings WHERE id = 'default';
    IF v_whatsapp_enabled IS FALSE THEN
        RAISE EXCEPTION 'WhatsApp ordering is currently paused by store administration.';
    END IF;

    -- Point 5 Server-Side Check 2: Sold-out design check
    IF p_design_id IS NOT NULL THEN
        SELECT is_sold_out, price INTO v_is_sold_out, v_design_price
        FROM public.designs
        WHERE id = p_design_id;

        IF v_is_sold_out IS TRUE THEN
            RAISE EXCEPTION 'This design is currently sold out.';
        END IF;
    END IF;

    -- 1. Database Rate Limiting: max 10 leads per session per hour
    SELECT COUNT(*)
    INTO v_recent_leads_count
    FROM public.leads
    WHERE session_id = p_session_id
      AND public.leads.created_at > (NOW() - INTERVAL '1 hour');

    IF v_recent_leads_count >= 10 THEN
        RAISE EXCEPTION 'Rate limit exceeded: maximum 10 leads per hour';
    END IF;

    -- 2. Deduplication: if same session_id + design + size + color tapped within 10 minutes, reuse lead
    SELECT leads.id, leads.lead_code, leads.assigned_whatsapp_number, leads.created_at
    INTO v_existing_lead
    FROM public.leads
    WHERE leads.session_id = p_session_id
      AND leads.design_id IS NOT DISTINCT FROM p_design_id
      AND leads.size IS NOT DISTINCT FROM p_size
      AND leads.color IS NOT DISTINCT FROM p_color
      AND leads.created_at > (NOW() - INTERVAL '10 minutes')
    ORDER BY leads.created_at DESC
    LIMIT 1;

    IF v_existing_lead.id IS NOT NULL THEN
        RETURN QUERY SELECT
            v_existing_lead.id,
            v_existing_lead.lead_code,
            v_existing_lead.assigned_whatsapp_number,
            TRUE,
            v_existing_lead.created_at;
        RETURN;
    END IF;

    -- 3. Atomic Round-Robin Routing: Lock site_settings row for update
    SELECT whatsapp_numbers, last_whatsapp_index
    INTO v_numbers, v_next_idx
    FROM public.site_settings
    WHERE id = 'default'
    FOR UPDATE;

    IF v_numbers IS NULL OR jsonb_array_length(v_numbers) = 0 THEN
        v_numbers := '["+917852811695", "+919376406174"]'::jsonb;
        v_next_idx := 0;
    END IF;

    v_num_count := jsonb_array_length(v_numbers);
    v_next_number := v_numbers ->> (v_next_idx % v_num_count);

    UPDATE public.site_settings
    SET last_whatsapp_index = (v_next_idx + 1) % v_num_count,
        updated_at = NOW()
    WHERE id = 'default';

    -- 4. Generate lead code from sequence (e.g. RVX-1001)
    v_new_lead_code := 'RVX-' || nextval('public.lead_code_seq')::text;

    -- 5. Insert new lead
    INSERT INTO public.leads (
        lead_code,
        session_id,
        design_id,
        size,
        color,
        assigned_whatsapp_number,
        source,
        status,
        sale_price,
        user_agent,
        ip_hash,
        created_at,
        updated_at
    )
    VALUES (
        v_new_lead_code,
        p_session_id,
        p_design_id,
        p_size,
        p_color,
        v_next_number,
        p_source,
        'new',
        COALESCE(v_design_price, 0),
        p_user_agent,
        p_ip_hash,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_new_lead_id;

    RETURN QUERY SELECT
        v_new_lead_id,
        v_new_lead_code,
        v_next_number,
        FALSE,
        NOW();
END;
$$;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Banners Policies
DROP POLICY IF EXISTS "Public can view active scheduled banners" ON public.banners;
CREATE POLICY "Public can view active scheduled banners" ON public.banners
    FOR SELECT TO anon, authenticated
    USING (
        (is_active = true AND (start_at IS NULL OR start_at <= NOW()) AND (end_at IS NULL OR end_at >= NOW()))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
CREATE POLICY "Admins can manage banners" ON public.banners
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Home Sections Policies
DROP POLICY IF EXISTS "Public can view home sections" ON public.home_sections;
CREATE POLICY "Public can view home sections" ON public.home_sections
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage home sections" ON public.home_sections;
CREATE POLICY "Admins can manage home sections" ON public.home_sections
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Content Blocks Policies
DROP POLICY IF EXISTS "Public can view active content blocks" ON public.content_blocks;
CREATE POLICY "Public can view active content blocks" ON public.content_blocks
    FOR SELECT TO anon, authenticated
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage content blocks" ON public.content_blocks;
CREATE POLICY "Admins can manage content blocks" ON public.content_blocks
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Menu Items Policies
DROP POLICY IF EXISTS "Public can view active menu items" ON public.menu_items;
CREATE POLICY "Public can view active menu items" ON public.menu_items
    FOR SELECT TO anon, authenticated
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;
CREATE POLICY "Admins can manage menu items" ON public.menu_items
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Pages Policies
DROP POLICY IF EXISTS "Public can view published pages" ON public.pages;
CREATE POLICY "Public can view published pages" ON public.pages
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Admins can manage pages" ON public.pages
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 12. STORAGE BUCKET: site-media
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-media', 'site-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public site-media read" ON storage.objects;
CREATE POLICY "Public site-media read" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'site-media');

DROP POLICY IF EXISTS "Admins site-media write" ON storage.objects;
CREATE POLICY "Admins site-media write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'site-media' AND public.is_admin());

DROP POLICY IF EXISTS "Admins site-media update" ON storage.objects;
CREATE POLICY "Admins site-media update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'site-media' AND public.is_admin())
    WITH CHECK (bucket_id = 'site-media' AND public.is_admin());

DROP POLICY IF EXISTS "Admins site-media delete" ON storage.objects;
CREATE POLICY "Admins site-media delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'site-media' AND public.is_admin());

-- 13. SEED DEFAULT CMS DATA (Point 3: Strictly neutral copy, no invented claims)

-- A. Homepage Sections (Default Order)
INSERT INTO public.home_sections (key, title, subtitle, enabled, sort_order, config)
VALUES
    ('banner_slider', 'Highlights', 'Featured Drops & Releases', true, 1, '{"height": "default"}'::jsonb),
    ('hero_3d', 'Streetwear Visualizer', 'Interactive 3D Preview', true, 2, '{}'::jsonb),
    ('categories', 'Collections', 'Explore Aesthetic Disciplines', true, 3, '{}'::jsonb),
    ('featured', 'Featured Streetwear Drops', 'Limited print releases', true, 4, '{"limit": 8}'::jsonb),
    ('new_drops', 'Latest Drops', 'Freshly queued designs', true, 5, '{"limit": 4}'::jsonb),
    ('how_it_works', 'How Print-on-Demand Works', 'Direct WhatsApp Ordering', true, 6, '{}'::jsonb),
    ('why_revntrix', 'The REVNTRIX Standard', 'Quality & Transparency', true, 7, '{}'::jsonb),
    ('testimonials', 'Customer Feedback', 'Real community reviews', false, 8, '{}'::jsonb), -- Disabled until real reviews exist
    ('faq', 'Frequently Asked Questions', 'Orders, delivery and sizing', true, 9, '{}'::jsonb),
    ('custom_callout', 'Custom Collaborations', 'Talk to our team', true, 10, '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- B. Default Header Menu Items
INSERT INTO public.menu_items (location, label, url, sort_order, is_active)
VALUES
    ('header', 'Shop All', '/shop', 1, true),
    ('header', 'Cyberpunk', '/shop?category=cyberpunk-anime', 2, true),
    ('header', 'Typography', '/shop?category=streetwear-typography', 3, true),
    ('header', 'Vintage', '/shop?category=vintage-grunge', 4, true),
    ('header', 'Minimal', '/shop?category=abstract-minimal', 5, true),
    ('header', 'About', '/about', 6, true)
ON CONFLICT DO NOTHING;

-- C. Default Footer Menu Items
INSERT INTO public.menu_items (location, label, url, sort_order, is_active)
VALUES
    ('footer', 'All T-Shirts', '/shop', 1, true),
    ('footer', 'About REVNTRIX', '/about', 2, true),
    ('footer', 'Shipping & Returns', '/shipping-and-returns', 3, true),
    ('footer', 'FAQ', '/faq', 4, true),
    ('footer', 'Privacy Policy', '/privacy', 5, true),
    ('footer', 'Terms of Service', '/terms', 6, true),
    ('footer', 'Contact Us', '/contact', 7, true)
ON CONFLICT DO NOTHING;

-- D. Default Content Blocks (How It Works & Neutral "Why Revntrix")
INSERT INTO public.content_blocks (type, title, subtitle, content, sort_order, is_active)
VALUES
    ('how_it_works', '01. Choose Design', 'Browse Drops', 'Explore our curated drops and view artworks on the real 3D t-shirt canvas.', 1, true),
    ('how_it_works', '02. Pick Color & Size', 'Select Fit', 'Test colorways in 3D and pick your size from S up to XXL using our fit guide.', 2, true),
    ('how_it_works', '03. Order on WhatsApp', 'Instant Routing', 'Your order specs and unique ref code prefill instantly in WhatsApp.', 3, true),
    ('how_it_works', '04. Printed & Delivered', 'Doorstep Delivery', 'Confirm payment on WhatsApp; our printer prepares and dispatches to your doorstep.', 4, true),
    -- Point 3: Neutral Why Revntrix
    ('why_revntrix', 'Printed to order', 'Zero deadstock', 'Each item is printed upon confirmation, avoiding overproduction.', 1, true),
    ('why_revntrix', 'Delivered across India', 'Tracked courier', 'Courier delivery available across all service PIN codes in India.', 2, true),
    ('why_revntrix', 'Order easily on WhatsApp', 'Direct human concierge', 'No complicated cart or login forms. Chat with us directly.', 3, true),
    -- Initial FAQs
    ('faq', 'How do I place an order?', 'Ordering process', 'Select your t-shirt design, size, and colorway, then tap "Order on WhatsApp". Your order details will be prefilled in a WhatsApp chat where we confirm payment via UPI.', 1, true),
    ('faq', 'What payment methods do you accept?', 'Payment', 'We accept direct UPI transfers (Google Pay, PhonePe, Paytm, BHIM) securely in WhatsApp.', 2, true),
    ('faq', 'How long does production and shipping take?', 'Timelines', 'Each shirt is custom printed upon order confirmation and dispatched across India via tracked courier.', 3, true),
    ('faq', 'Can I request a custom size or graphic?', 'Customization', 'Yes! Chat with our concierge on WhatsApp to discuss custom artwork placements or bulk crew orders.', 4, true)
ON CONFLICT DO NOTHING;

-- E. Default Custom Pages (Point 3: Neutral copy marked as placeholders to review)
INSERT INTO public.pages (slug, title, content, seo_title, seo_description, is_published)
VALUES
    ('about', 'About REVNTRIX',
'# About REVNTRIX

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

REVNTRIX is a print-on-demand streetwear brand created for original graphic apparel.

### Production Philosophy
We print each t-shirt to order. This eliminates mass inventory waste and ensures every garment is prepared specifically for you.

### Direct Ordering
Instead of traditional checkout carts, orders move directly to our WhatsApp concierge for transparent, personal order confirmation and direct UPI payment.',
'About REVNTRIX | Streetwear Brand', 'Learn about REVNTRIX print-on-demand streetwear philosophy.', true),

    ('contact', 'Contact REVNTRIX',
'# Contact REVNTRIX

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

Have questions about your order, sizing, or collaboration? Reach our team directly:

- **Email**: revntrix@gmail.com
- **WhatsApp Line 1**: [+91 7852811695](https://wa.me/917852811695)
- **WhatsApp Line 2**: [+91 9376406174](https://wa.me/919376406174)
- **Operating Hours**: Monday – Saturday, 10:00 AM – 8:00 PM IST',
'Contact REVNTRIX | Customer Support', 'Get in touch with REVNTRIX via email or WhatsApp.', true),

    ('shipping-and-returns', 'Shipping & Returns Policy',
'# Shipping & Returns Policy

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

### Dispatch & Shipping
- Each order is printed on demand upon confirmation on WhatsApp.
- Orders are queued for printing and dispatched across India via tracked couriers.
- Tracking details are provided directly via WhatsApp.

### Order Policy
- As items are custom printed upon order, orders cannot be cancelled once production commences.
- Contact our team on WhatsApp for any order inquiries or updates.',
'Shipping & Returns | REVNTRIX', 'Review delivery and order guidelines.', true),

    ('privacy', 'Privacy Policy',
'# Privacy Policy

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

REVNTRIX respects your privacy. When you initiate an order, we collect order specifications, contact phone number, and delivery address to fulfill your print-on-demand shipment.

We do not sell your personal information to third parties. Data is used solely for order dispatch, customer support, and essential website analytics.',
'Privacy Policy | REVNTRIX', 'Privacy policy for REVNTRIX print-on-demand platform.', true),

    ('terms', 'Terms of Service',
'# Terms of Service

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

By accessing or placing an order on REVNTRIX, you agree to these Terms:

1. **Ordering**: Orders are placed via WhatsApp and fulfilled upon payment receipt.
2. **Pricing**: All prices are listed in Indian Rupees (₹ INR).
3. **Print-on-Demand**: Every t-shirt is made to order; minor placement variations within industry standards may occur.
4. **Intellectual Property**: Brand graphics and website content are the property of REVNTRIX.',
'Terms of Service | REVNTRIX', 'Terms of service and customer agreements for REVNTRIX.', true),

    ('faq', 'Frequently Asked Questions',
'# Frequently Asked Questions

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

Find answers to common questions regarding ordering, payment, and shipping across India.',
'FAQ | REVNTRIX', 'Frequently asked questions about REVNTRIX drops and ordering.', true)
ON CONFLICT (slug) DO UPDATE
SET updated_at = NOW();

-- F. Initial Seed Banners (3 aesthetic streetwear banners)
INSERT INTO public.banners (
    title,
    subtitle,
    cta_text,
    link_type,
    link_target,
    desktop_image_url,
    mobile_image_url,
    text_mode,
    text_align,
    text_color,
    overlay_opacity,
    is_active,
    sort_order
)
VALUES
    (
        'CYBERPUNK TOKYO 2099',
        'Next-gen high-definition streetwear drops.',
        'Explore Collection',
        'category',
        'cyberpunk-anime',
        '/banners/banner-1-desktop.svg',
        '/banners/banner-1-mobile.svg',
        'overlay',
        'left',
        'light',
        30,
        true,
        1
    ),
    (
        'BRUTALIST ARCHIVE SERIES',
        'Monolithic typography & raw industrial silhouettes.',
        'View Drops',
        'shop',
        '/shop',
        '/banners/banner-2-desktop.svg',
        '/banners/banner-2-mobile.svg',
        'overlay',
        'center',
        'light',
        40,
        true,
        2
    ),
    (
        'PRINTED ON DEMAND IN INDIA',
        'Zero overproduction. Chat directly on WhatsApp.',
        'Chat with Stylist',
        'whatsapp',
        '',
        '/banners/banner-3-desktop.svg',
        '/banners/banner-3-mobile.svg',
        'overlay',
        'left',
        'light',
        25,
        true,
        3
    )
ON CONFLICT DO NOTHING;
