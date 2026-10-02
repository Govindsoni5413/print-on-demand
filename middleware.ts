import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // Fast path for admin, api, maintenance, and asset paths
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname === '/maintenance' ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Check if admin session cookie exists
    const cookies = req.cookies.getAll();
    const hasAdminSession = cookies.some(
      (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
    );

    if (hasAdminSession) {
      return NextResponse.next();
    }

    // Check maintenance mode with timeout (fail-open)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && anonKey) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/site_settings?id=eq.default&select=maintenance_mode`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
            },
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.maintenance_mode === true) {
            const maintenanceUrl = req.nextUrl.clone();
            maintenanceUrl.pathname = '/maintenance';
            return NextResponse.rewrite(maintenanceUrl);
          }
        }
      } catch {
        // Fail open on error
      } finally {
        clearTimeout(timeoutId);
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static file extensions (svg, png, jpg, glb, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|gltf|ico|txt|xml|css|js)$).*)',
  ],
};

