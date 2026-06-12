import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './lib/constants';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith(ROUTES.LOGIN);
  const hasCookieToken = request.cookies.has('auth_token');

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/master') || pathname.startsWith('/teams') || pathname.startsWith('/leaderboard') || pathname.startsWith('/mentoring') || pathname.startsWith('/profile')) {
    // Rely on client-side protection primarily for now since Zustand uses localStorage
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
