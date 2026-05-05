import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/contests', '/interviews', '/interview'];
const LOGIN_PATH = '/login';

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function buildLoginRedirect(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

async function hasSession(req: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return false;

  const cookie = req.headers.get('cookie') ?? '';
  if (!cookie) return false;

  try {
    const res = await fetch(new URL('/api/auth/get-session', backend), {
      method: 'GET',
      headers: {
        cookie,
      },
      cache: 'no-store',
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { user?: unknown } | null;
    return Boolean(data && data.user);
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only enforce auth on protected app routes.
  if (!isProtectedPath(pathname)) return NextResponse.next();

  // If already on login, never redirect-loop.
  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) return NextResponse.next();

  const ok = await hasSession(req);
  if (ok) return NextResponse.next();

  return buildLoginRedirect(req);
}

export const config = {
  matcher: ['/contests/:path*', '/interviews/:path*', '/interview/:path*'],
};
