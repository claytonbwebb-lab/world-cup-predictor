import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup', '/admin/login', '/api/admin/login'];
const PROTECTED_ROUTES = ['/dashboard', '/fixtures', '/leaderboard', '/leagues'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Maintenance Mode ───────────────────────────────────────────────────────
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const bypassPass = process.env.NEXT_PUBLIC_MAINTENANCE_BYPASS_PASS;

  if (maintenanceMode && bypassPass) {
    const MAINTENANCE_BYPASS_PATHS = ['/maintenance', '/_next', '/favicon', '/api/maintenance-bypass'];
    const isMaintenanceBypassPath = MAINTENANCE_BYPASS_PATHS.some(p => pathname.startsWith(p));

    if (!isMaintenanceBypassPath) {
      const bypassCookie = request.cookies.get('x-maint-bypass')?.value;
      const bypassQuery = request.nextUrl.searchParams.get('__maint_bypass');

      if (bypassQuery) {
        if (bypassQuery === bypassPass) {
          const cleanUrl = new URL(request.url);
          cleanUrl.searchParams.delete('__maint_bypass');
          const response = NextResponse.redirect(cleanUrl);
          response.cookies.set('x-maint-bypass', bypassPass, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
          });
          return response;
        } else {
          const cleanUrl = new URL(request.url);
          cleanUrl.searchParams.delete('__maint_bypass');
          return NextResponse.redirect(cleanUrl);
        }
      }

      if (bypassCookie !== bypassPass) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }
  }
  // ─── End Maintenance Mode ───────────────────────────────────────────────────

  // Public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  if (isPublicRoute) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // Protected routes need auth
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/login', request.url);
    const fullPath = pathname + (request.nextUrl.search || '');
    redirectUrl.searchParams.set('redirect', pathname);
    const joinCode = request.nextUrl.searchParams.get('join');
    if (joinCode) redirectUrl.searchParams.set('join', joinCode);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
