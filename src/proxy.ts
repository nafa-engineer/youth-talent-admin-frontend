import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './lib/constants';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/master') || pathname.startsWith('/teams') || pathname.startsWith('/leaderboard') || pathname.startsWith('/mentoring') || pathname.startsWith('/profile')) {
    // Rely on client-side protection with Zustand store persistence
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
