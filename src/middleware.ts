import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the admin login page & its API unauthenticated.
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout'
  ) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session || session.role !== 'admin') {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login dulu.' } },
        { status: 401 },
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
