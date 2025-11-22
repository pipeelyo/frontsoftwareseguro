import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

interface JwtPayload {
  userId: string;
  role: 'VIGILANTE' | 'SUPERVISOR' | 'ADMIN' | 'CLIENTE' | 'ADMINISTRATIVO';
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  console.log(`[Middleware] Token from cookie: ${token ? 'found' : 'not found'}`);

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  try {
    console.log('[Middleware] Verifying token...');
    const { payload } = await jwtVerify<JwtPayload>(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    console.log(`[Middleware] Token verified successfully for user: ${payload.userId}, role: ${payload.role}`);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('JWT verification failed:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/';
    const response = NextResponse.redirect(url);
    response.cookies.delete('auth_token');
    return response;
  }
}

export const runtime = 'nodejs';

export const config = {
  matcher: [
    // UI Routes
    '/profile',
    '/dashboard',
    '/client-portal',
    '/documents',

    // API Routes
    '/api/shifts/:path*',
    '/api/incidents/:path*',
    '/api/documents/:path*',
    '/api/reports/:path*',
    '/api/audit/:path*',
  ],
};
