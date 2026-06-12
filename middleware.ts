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
      // Novirza uz sign-in, saglabājot sākotnējo galamērķi (lai pēc
      // pieslēgšanās atgrieztos tieši /admin lapā, nevis sākumlapā)
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  }
  
  // Sign-in un sign-up lapas bez i18n
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return NextResponse.next();
  }
  
  // API routes bez i18n
  if (pathname.startsWith('/api')) {
    // Publiskie POST galapunkti (apmeklētāju formas) — bez autentifikācijas
    const PUBLIC_API_POST = [
      '/api/contact',
      '/api/access-request',
      '/api/verify-code',
      '/api/increment-view',
    ];

    const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    const isAdminApi = pathname.startsWith('/api/admin');
    const isPublicPost = PUBLIC_API_POST.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    );

    // Pieprasām autentifikāciju visiem /api/admin/* un visām datu izmaiņām
    // (POST/PUT/PATCH/DELETE), izņemot publiskās formas augstāk.
    if ((isAdminApi || isMutation) && !isPublicPost) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

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