-- REVNTRIX Database Schema & Initial Setup Migration
-- 001_init.sql
-- Conforms strictly to requirements:
-- - Atomic round-robin RPC with row lock
-- - lead_code_seq starting at 1001 (RVX-1001)
-- - DB-level rate limiting (max 10 leads/hour/session)
-- - 10-minute duplicate lead reuse
-- - is_admin() security definer on all tables
-- - SQL aggregate functions for dashboard analytics
-- - Indexes on created_at and relational keys
-- - Neutral site settings (no fake claims/testimonials)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sequence for lead codes starting at 1001
CREATE SEQUENCE IF NOT EXISTS public.lead_code_seq START WITH 1001;

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- linked to auth.users
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DESIGNS TABLE
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    price NUMERIC NOT NULL,
    mrp NUMERIC NOT NULL,
    colors JSONB NOT NULL DEFAULT '[]'::jsonb,
    sizes TEXT[] NOT NULL DEFAULT '{"S","M","L","XL","XXL"}',
    design_image_url TEXT NOT NULL,
    placement TEXT NOT NULL DEFAULT 'chest', -- 'chest', 'center', 'back'
    design_scale NUMERIC NOT NULL DEFAULT 1.0,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_drop BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DESIGN IMAGES TABLE (Gallery / mockups)
CREATE TABLE IF NOT EXISTS public.design_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID NOT NULL REFERENCES public.designs(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LEADS TABLE (WhatsApp orders & inquiries)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_code TEXT NOT NULL UNIQUE DEFAULT ('RVX-' || nextval('public.lead_code_seq')::text),
    session_id TEXT NOT NULL,
    design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
    size TEXT,
    color TEXT,
    assigned_whatsapp_number TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'product_page', -- 'product_page', 'floating_button', 'direct'
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'confirmed', 'paid', 'printing', 'shipped', 'delivered', 'cancelled', 'spam'
    customer_name TEXT,
    customer_phone TEXT,
    shipping_address TEXT,
    cost_price NUMERIC DEFAULT 0,
    sale_price NUMERIC DEFAULT 0,
    printer_notes TEXT,
    user_agent TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EVENTS TABLE (Analytics / Views)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL, -- 'page_view', 'product_view', 'whatsapp_click'
    session_id TEXT NOT NULL,
    design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
    path TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT 'REVNTRIX',
    tagline TEXT NOT NULL DEFAULT 'Premium cotton tees',
    description TEXT NOT NULL DEFAULT 'Printed to order, delivered across India',
    accent_color TEXT NOT NULL DEFAULT '#0A0A0A',
    whatsapp_numbers JSONB NOT NULL DEFAULT '["+917852811695", "+919376406174"]'::jsonb,
    last_whatsapp_index INT NOT NULL DEFAULT 0,
    email TEXT NOT NULL DEFAULT 'revntrix@gmail.com',
    announcement_bar TEXT NOT NULL DEFAULT 'Printed to order • Delivered across India • Premium cotton',
    shipping_info TEXT NOT NULL DEFAULT 'Orders dispatched in 24-48 hours. Express delivery across India.',
    return_policy TEXT NOT NULL DEFAULT 'Hassle-free replacement for defective or misprinted products within 7 days.',
    size_guide_content JSONB NOT NULL DEFAULT '{"note": "Regular fit. Order your standard t-shirt size.", "sizes": [{"size": "S", "chest": "38 in", "length": "27 in"}, {"size": "M", "chest": "40 in", "length": "28 in"}, {"size": "L", "chest": "42 in", "length": "29 in"}, {"size": "XL", "chest": "44 in", "length": "30 in"}, {"size": "XXL", "chest": "46 in", "length": "31 in"}]}'::jsonb,
    testimonials JSONB NOT NULL DEFAULT '[]'::jsonb, -- Empty by default (no fake claims)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_designs_slug ON public.designs (slug);
CREATE INDEX IF NOT EXISTS idx_designs_status ON public.designs (status);
CREATE INDEX IF NOT EXISTS idx_designs_category_id ON public.designs (category_id);
CREATE INDEX IF NOT EXISTS idx_design_images_design_id ON public.design_images (design_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_session_id ON public.leads (session_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_design_id ON public.leads (design_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON public.events (event_name);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON public.events (session_id);

-- SECURITY DEFINER HELPER: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE email = (auth.jwt() ->> 'email')
       OR (auth_user_id IS NOT NULL AND auth_user_id = auth.uid())
  );
$$;

-- ATOMIC ROUTING, DEDUPLICATION & RATE LIMIT FUNCTION
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
BEGIN
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

    IF p_design_id IS NOT NULL THEN
        SELECT price INTO v_design_price FROM public.designs WHERE id = p_design_id;
    END IF;

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

-- DASHBOARD AGGREGATE FUNCTIONS (Point 5)
-- 1. Summary Metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_leads BIGINT,
    total_chats BIGINT,
    total_orders BIGINT,
    conversion_rate NUMERIC,
    total_revenue NUMERIC,
    total_profit NUMERIC,
    page_views BIGINT,
    product_views BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_total_leads BIGINT;
    v_total_chats BIGINT;
    v_total_orders BIGINT;
    v_total_rev NUMERIC;
    v_total_cost NUMERIC;
    v_page_views BIGINT;
    v_prod_views BIGINT;
BEGIN
    -- WhatsApp chats count leads (Single source of truth)
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status != 'spam'),
        COUNT(*) FILTER (WHERE status IN ('paid', 'printing', 'shipped', 'delivered')),
        COALESCE(SUM(sale_price) FILTER (WHERE status IN ('paid', 'printing', 'shipped', 'delivered')), 0),
        COALESCE(SUM(cost_price) FILTER (WHERE status IN ('paid', 'printing', 'shipped', 'delivered')), 0)
    INTO
        v_total_leads,
        v_total_chats,
        v_total_orders,
        v_total_rev,
        v_total_cost
    FROM public.leads
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date);

    SELECT
        COUNT(*) FILTER (WHERE event_name = 'page_view'),
        COUNT(*) FILTER (WHERE event_name = 'product_view')
    INTO
        v_page_views,
        v_prod_views
    FROM public.events
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date);

    RETURN QUERY SELECT
        v_total_leads,
        v_total_chats,
        v_total_orders,
        CASE WHEN v_total_chats > 0 THEN ROUND((v_total_orders::NUMERIC / v_total_chats::NUMERIC) * 100, 2) ELSE 0 END,
        v_total_rev,
        (v_total_rev - v_total_cost),
        v_page_views,
        v_prod_views;
END;
$$;

-- 2. Daily Analytics for Charts
CREATE OR REPLACE FUNCTION public.get_daily_analytics(p_days INT DEFAULT 14)
RETURNS TABLE (
    day_date DATE,
    views BIGINT,
    leads BIGINT,
    orders BIGINT,
    revenue NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH dates AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days - 1) * INTERVAL '1 day',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE AS d
  ),
  lead_aggs AS (
    SELECT
      created_at::DATE AS d,
      COUNT(*) AS lead_count,
      COUNT(*) FILTER (WHERE status IN ('paid', 'printing', 'shipped', 'delivered')) AS order_count,
      COALESCE(SUM(sale_price) FILTER (WHERE status IN ('paid', 'printing', 'shipped', 'delivered')), 0) AS rev
    FROM public.leads
    WHERE created_at >= CURRENT_DATE - (p_days - 1) * INTERVAL '1 day'
    GROUP BY created_at::DATE
  ),
  event_aggs AS (
    SELECT
      created_at::DATE AS d,
      COUNT(*) AS view_count
    FROM public.events
    WHERE created_at >= CURRENT_DATE - (p_days - 1) * INTERVAL '1 day'
    GROUP BY created_at::DATE
  )
  SELECT
    dates.d AS day_date,
    COALESCE(event_aggs.view_count, 0) AS views,
    COALESCE(lead_aggs.lead_count, 0) AS leads,
    COALESCE(lead_aggs.order_count, 0) AS orders,
    COALESCE(lead_aggs.rev, 0) AS revenue
  FROM dates
  LEFT JOIN lead_aggs ON dates.d = lead_aggs.d
  LEFT JOIN event_aggs ON dates.d = event_aggs.d
  ORDER BY dates.d ASC;
$$;

-- 3. Top Designs Aggregate
CREATE OR REPLACE FUNCTION public.get_top_designs(p_limit INT DEFAULT 5)
RETURNS TABLE (
    design_id UUID,
    title TEXT,
    slug TEXT,
    price NUMERIC,
    lead_count BIGINT,
    order_count BIGINT,
    revenue NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    d.id AS design_id,
    d.title,
    d.slug,
    d.price,
    COUNT(l.id) AS lead_count,
    COUNT(l.id) FILTER (WHERE l.status IN ('paid', 'printing', 'shipped', 'delivered')) AS order_count,
    COALESCE(SUM(l.sale_price) FILTER (WHERE l.status IN ('paid', 'printing', 'shipped', 'delivered')), 0) AS revenue
  FROM public.designs d
  LEFT JOIN public.leads l ON d.id = l.design_id
  GROUP BY d.id, d.title, d.slug, d.price
  ORDER BY lead_count DESC, revenue DESC
  LIMIT p_limit;
$$;

-- 4. WhatsApp Number Distribution
CREATE OR REPLACE FUNCTION public.get_whatsapp_routing_stats()
RETURNS TABLE (
    phone_number TEXT,
    lead_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    assigned_whatsapp_number AS phone_number,
    COUNT(*) AS lead_count
  FROM public.leads
  GROUP BY assigned_whatsapp_number
  ORDER BY lead_count DESC;
$$;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Admins Table Policies
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admins;
CREATE POLICY "Admins can view admin list" ON public.admins
    FOR SELECT TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
CREATE POLICY "Admins can manage admins" ON public.admins
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Categories Policies
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Designs Policies
DROP POLICY IF EXISTS "Public can view published designs" ON public.designs;
CREATE POLICY "Public can view published designs" ON public.designs
    FOR SELECT TO anon, authenticated
    USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage designs" ON public.designs;
CREATE POLICY "Admins can manage designs" ON public.designs
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Design Images Policies
DROP POLICY IF EXISTS "Public can view published design images" ON public.design_images;
CREATE POLICY "Public can view published design images" ON public.design_images
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.designs
            WHERE designs.id = design_images.design_id
              AND (designs.status = 'published' OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Admins can manage design images" ON public.design_images;
CREATE POLICY "Admins can manage design images" ON public.design_images
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Leads Policies
DROP POLICY IF EXISTS "Admins can view and manage leads" ON public.leads;
CREATE POLICY "Admins can view and manage leads" ON public.leads
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Events Policies
DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;
CREATE POLICY "Anyone can insert events" ON public.events
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view events" ON public.events;
CREATE POLICY "Admins can view events" ON public.events
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- Site Settings Policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public bucket read" ON storage.objects;
CREATE POLICY "Public bucket read" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'designs');

DROP POLICY IF EXISTS "Admins bucket write" ON storage.objects;
CREATE POLICY "Admins bucket write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'designs' AND public.is_admin());

DROP POLICY IF EXISTS "Admins bucket update" ON storage.objects;
CREATE POLICY "Admins bucket update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'designs' AND public.is_admin())
    WITH CHECK (bucket_id = 'designs' AND public.is_admin());

DROP POLICY IF EXISTS "Admins bucket delete" ON storage.objects;
CREATE POLICY "Admins bucket delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'designs' AND public.is_admin());

-- INITIAL SEED DATA
-- Default Settings
INSERT INTO public.site_settings (id, brand_name, tagline, description, accent_color, email)
VALUES (
    'default',
    'REVNTRIX',
    'Premium cotton tees',
    'Printed to order, delivered across India',
    '#0A0A0A',
    'revntrix@gmail.com'
)
ON CONFLICT (id) DO NOTHING;

-- Pre-seed revntrix@gmail.com into admins
INSERT INTO public.admins (email, role)
VALUES ('revntrix@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Auto-link auth_user_id on signup/login trigger
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admins
  SET auth_user_id = NEW.id
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin_link ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_link
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_auth_user();
