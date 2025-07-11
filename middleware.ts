import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server'; // TRŪKA IMPORT!

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => { // PIEVIENO ASYNC!
  const { pathname } = req.nextUrl;
  
  // Static faili - bez middleware
  const isStaticFile = [
    pathname.startsWith('/_next'),
    pathname.startsWith('/uploads'),
    pathname.startsWith('/images'),
    pathname.includes('.') && !pathname.startsWith('/api'),
  ].some(Boolean);
  
  if (isStaticFile) {
    return NextResponse.next(); // PIEVIENO NextResponse.next()!
  }
  
  // Admin lapas ar autentifikāciju
  if (pathname.startsWith('/admin')) {
    const { userId } = await auth(); // PAREIZĀ SINTAKSE!
    
    if (!userId) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return NextResponse.next(); // PIEVIENO NextResponse.next()!
  }
  
  // API routes bez i18n
  if (pathname.startsWith('/api')) {
    return NextResponse.next(); // PIEVIENO NextResponse.next()!
  }
  
  // Visas citas lapas ar i18n
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};