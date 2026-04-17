import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup', '/admin/login', '/api/admin/login'];
const PROTECTED_ROUTES = ['/dashboard', '/fixtures', '/leaderboard', '/leagues'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check public routes FIRST — before any auth
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  // Admin session check (only for non-login admin routes)
  if (isAdminRoute && !isAdminLoginRoute && !isAdminApiRoute) {
    const adminSession = request.cookies.get('admin_session')?.value;
    if (adminSession !== '1') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Skip remaining auth for public routes
  if (isPublicRoute || isAdminLoginRoute || isAdminApiRoute) {
    return NextResponse.next();
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
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
