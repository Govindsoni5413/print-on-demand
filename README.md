# REVNTRIX — Print-on-Demand E-Commerce & Admin Platform

REVNTRIX is a production-ready streetwear print-on-demand platform built with **Next.js 15 (App Router)**, **React 19**, **Three.js** (`@react-three/fiber` v9 & `@react-three/drei` v10), **Tailwind CSS**, and **Supabase (PostgreSQL with RLS & Storage)**.

Instead of traditional checkout gateways, orders transition directly to WhatsApp with pre-filled specifications, atomic round-robin routing between multiple business phone lines, and complete lead management in the internal admin portal.

---

## 🚀 Features

- **Interactive 3D T-Shirt Visualizer**:
  - Real GLB model loaded at `/public/models/tshirt.glb` with procedural geometry fallback.
  - Dynamic decal rendering for graphics on chest/center/back.
  - Realtime colorway switching and 360° orbit interaction.
- **Atomic Round-Robin Routing & Deduplication**:
  - Single Postgres RPC (`create_or_reuse_lead`) with row locking (`FOR UPDATE`) on `site_settings`.
  - Alternates customer taps between `+91 7852811695` and `+91 9376406174`.
  - Sequential lead codes generated from `lead_code_seq` starting at 1001 (`RVX-1001`).
  - Database-level rate limiting: max 10 leads/session/hour.
  - 10-minute duplicate lead reuse for same session, design, size, and color.
- **WhatsApp Concierge & Instant Redirect**:
  - Sticky mobile WhatsApp CTA using `window.location.assign(waUrl)` in the same tab (avoids popup blockers).
  - 2-second timeout protection fallback so customers are never blocked.
  - Floating WhatsApp button also logs inquiries (`design_id: null`) through the same atomic routing.
- **Full Admin Panel (`/admin`)**:
  - Realtime KPIs powered by SQL aggregate functions (`get_dashboard_metrics`, `get_daily_analytics`, `get_top_designs`, `get_whatsapp_routing_stats`).
  - Design catalog with live 3D preview in `DesignForm`.
  - Leads fulfillment pipeline with cost, sale price, and profit calculation.
  - Categories manager & global site settings editor.
- **Strict Security & Clean Architecture**:
  - Security Definer `is_admin()` function on all tables.
  - Service-role key isolated exclusively to server route handlers (`/api/track/*`).
  - Dynamic `app/sitemap.ts` driven by `NEXT_PUBLIC_SITE_URL`.
  - 100% neutral copy: no invented GSM claims, no fake shipping offers, and no fake testimonials.

- **Auto-Changing Homepage Banner Slider (`/admin/banners`)**:
  - Full-width carousel with configurable autoplay interval, pause on hover/touch, swipe gestures, dots, and arrows.
  - Responsive imagery: separate desktop (`1920x800`) and mobile portrait (`1080x1350`) crops via `<picture>` tag.
  - Rich content overlays with alignment, color themes, and scrim opacity sliders, or "Image only" mode.
  - Dynamic ID-to-slug target resolution for products and categories; safe custom URLs with Zod.
  - Scheduling (`start_at` / `end_at`) with Next.js ISR `revalidate = 60`.
  - Banner click tracking via `events.banner_id` and SQL aggregate `get_banner_click_stats()`.
- **Full Website Content Manager (CMS)**:
  - **Homepage Section Builder (`/admin/website/home`)**: Toggle visibility and reorder sections (`banner_slider`, `hero_3d`, `categories`, `featured`, etc.). Auto-hides banner slider when zero live banners exist.
  - **Content Blocks (`/admin/website/content`)**: Manage How It Works, Why Revntrix, FAQs, and Customer Reviews.
  - **Navigation Menus (`/admin/website/menus`)**: Header navbar and footer navigation link management with layout revalidation.
  - **Pages & Markdown (`/admin/website/pages`)**: Custom Markdown pages (`/about`, `/contact`, `/shipping-and-returns`, `/privacy`, `/terms`, `/faq`) with live preview and safe rendering (no raw HTML).
  - **Media Library (`/admin/website/media`)**: Storage bucket browser (`site-media`) with 5MB file validation.
  - **Store Controls (`/admin/settings`)**: WhatsApp Master Switch, Edge Maintenance Mode, Branding logos, and Announcement Bar.

---

## 🛠️ Tech Stack & Version Compatibility

- **Next.js**: `15.5.x` (App Router, ISR, Server Actions, Route Handlers, Edge Middleware)
- **React**: `19.0.0`
- **Three.js Stack**: `three@^0.174.0`, `@react-three/fiber@^9.8.1`, `@react-three/drei@^10.7.9`
- **Markdown**: `react-markdown` (safe strict parsing without raw HTML)
- **Database & Auth**: Supabase (`@supabase/ssr@^0.5.2`, `@supabase/supabase-js@^2.49.1`)
- **Styling**: Tailwind CSS, PostCSS, Lucide Icons
- **Forms & Validation**: React Hook Form, Zod, `@hookform/resolvers`
- **Charts**: Recharts

---

## 📋 Supabase Setup & Database Migration

### 1. Database Schema Execution Order
1. Apply [`supabase/migrations/001_init.sql`](file:///Users/ansolution/Documents/prient%20on%20demand/supabase/migrations/001_init.sql) in your **Supabase Dashboard** -> **SQL Editor** (creates initial tables, leads sequence, and RPC).
2. Apply [`supabase/migrations/002_cms.sql`](file:///Users/ansolution/Documents/prient%20on%20demand/supabase/migrations/002_cms.sql) in the **SQL Editor** (adds banners, home sections, content blocks, menus, pages, `site-media` bucket, and server-side sold-out / WhatsApp enforcement).
3. Both migrations are 100% idempotent (`IF NOT EXISTS` / `CREATE OR REPLACE`) and safe to re-run.

### 2. Creating the First Admin User (`revntrix@gmail.com`)
1. In your Supabase Dashboard, go to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
3. Enter:
   - **Email**: `revntrix@gmail.com`
   - **Password**: (Choose a secure password)
   - Enable "Auto Confirm User".
4. Run this query in the **SQL Editor** to ensure the admin role is linked:
```sql
INSERT INTO public.admins (email, role)
VALUES ('revntrix@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;
```
*(The schema also includes a trigger `on_auth_user_created_admin_link` that automatically links `auth_user_id` when the admin signs in).*

---

## ⚙️ Environment Variables

Create `.env.local` based on `.env.example`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Supabase Service Role (Server-side ONLY, never expose to client)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Site URL for SEO / Sitemap / OpenGraph
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Default WhatsApp Numbers
NEXT_PUBLIC_DEFAULT_WHATSAPP_1=917852811695
NEXT_PUBLIC_DEFAULT_WHATSAPP_2=919376406174
```

---

## 📦 How to Add a New Design

1. Log in to the Admin Panel at `/admin/login`.
2. Navigate to **Designs** -> **Add New Design** (`/admin/designs/new`).
3. Fill in the title, URL slug, category, price (₹), and MRP.
4. In **Artwork & 3D Placement**, provide the URL to a transparent PNG or SVG graphic (e.g. `/designs/neo-tokyo.svg` or an uploaded Supabase Storage asset).
5. Watch the **Live 3D Decal Preview** on the right side of the screen update in real time!
6. Select the print placement (`chest`, `center`, or `back`) and adjust the scale slider.
7. Click any color swatch to test how the artwork renders against black, white, violet, or custom colors.
8. Check **Published** and save. The product will immediately appear in the storefront catalog.

---

## 👕 How to Swap the 3D T-Shirt Model

The 3D viewer loads standard GLTF/GLB models:
1. Place your `.glb` file at `/public/models/tshirt.glb`.
2. Ensure the node/mesh name inside your GLB corresponds to `T_Shirt_male` (or update `components/3d/TshirtModel.tsx` to match your custom mesh name).
3. If the GLB fails to load or WebGL is unsupported on older devices, `components/3d/ProceduralShirt.tsx` automatically renders as a seamless fallback.

---

## 🎨 How to Change the Brand Accent Color

- **In Admin UI**: Go to `/admin/settings` -> **Accent Color** picker -> Save.
- **In CSS**: In `app/globals.css`, change `--brand-accent` and `--brand-accent-hover`.

---

## 🚀 Vercel Deployment Steps

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) -> **Add New Project**.
3. Import your repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your custom domain or Vercel URL, e.g. `https://revntrix.vercel.app`)
   - `NEXT_PUBLIC_DEFAULT_WHATSAPP_1` (`917852811695`)
   - `NEXT_PUBLIC_DEFAULT_WHATSAPP_2` (`919376406174`)
5. Click **Deploy**.
