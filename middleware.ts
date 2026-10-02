import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow:
  // 1. /admin/*
  // 2. /api/*
  // 3. /_next/*
  // 4. /maintenance
  // 5. Static files (favicon, robots, sitemap, fonts, images, 3D models)
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/maintenance' ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|gif|glb|gltf|css|js|woff|woff2|ttf|ico)$/i)
  ) {
    return NextResponse.next();
  }

  // Allow logged-in admins to preview the storefront
  const hasAdminSession = req.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));

  if (hasAdminSession) {
    return NextResponse.next();
  }

  // Edge-safe cached fetch with ~30s revalidation: does NOT query DB on every request
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && anonKey) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/site_settings?id=eq.default&select=maintenance_mode`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          next: { revalidate: 30, tags: ['site_settings', 'maintenance'] },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data[0] && data[0].maintenance_mode === true) {
          const maintenanceUrl = req.nextUrl.clone();
          maintenanceUrl.pathname = '/maintenance';
          return NextResponse.rewrite(maintenanceUrl);
        }
      }
    }
  } catch (error) {
    // In case of network error, fail open to avoid bringing down the storefront
    console.error('Middleware maintenance check error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
