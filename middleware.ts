import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Static faili - bez middleware
  const isStaticFile = [
    pathname.startsWith('/_next'),
    pathname.startsWith('/uploads'),
    pathname.startsWith('/images'),
    pathname.includes('.') && !pathname.startsWith('/api'),
  ].some(Boolean);
  
  if (isStaticFile) {
    return NextResponse.next();
  }
  
  // Admin lapas ar autentifikāciju
  if (pathname.startsWith('/admin')) {
    const { userId } = await auth();
    
    if (!userId) {
      // Novirza uz sign-in lapu tā vietā, lai novirzītu uz /
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    
    return NextResponse.next();
  }
  
  // Sign-in un sign-up lapas bez i18n
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return NextResponse.next();
  }
  
  // API routes bez i18n
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Visas citas lapas ar i18n
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};