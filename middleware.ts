import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle ping for testing
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  // Allow everything else - no auth in development
  return NextResponse.next();
}

export const config = {
  matcher: ['/ping'],
};
