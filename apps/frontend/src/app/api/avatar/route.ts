import { NextResponse } from 'next/server';

function isPrivateHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;
  if (lower === '0.0.0.0') return true;
  if (lower === '127.0.0.1') return true;
  if (lower === '::1') return true;
  return false;
}

function isPrivateIpLike(hostname: string) {
  // Cheap SSRF guard for obvious private ranges when a raw IP is used as hostname.
  // (We intentionally avoid DNS resolution here.)
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;
  const [a, b] = hostname.split('.').map((n) => Number(n));
  if ([a, b].some((n) => Number.isNaN(n))) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }

  if (isPrivateHostname(target.hostname) || isPrivateIpLike(target.hostname)) {
    return NextResponse.json({ error: 'Blocked host' }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      // Avoid leaking cookies/credentials to third-party avatar hosts.
      credentials: 'omit',
      redirect: 'follow',
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'User-Agent': 'XContext-AvatarProxy',
      },
      // Next.js caching for route handlers
      cache: 'force-cache',
      next: { revalidate: 60 * 60 }, // 1 hour
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream failed', status: upstream.status },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return NextResponse.json({ error: 'Upstream is not an image' }, { status: 415 });
    }

    const contentLengthHeader = upstream.headers.get('content-length');
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null;
    // Hard cap at 5MB to avoid abusing the proxy.
    if (contentLength && Number.isFinite(contentLength) && contentLength > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    const res = new NextResponse(upstream.body, { status: 200 });
    res.headers.set('Content-Type', contentType);
    // Cache both at browser + any proxy/CDN.
    res.headers.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    );
    // Reduce referrer leakage if the browser ever re-requests directly.
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
  } catch {
    return NextResponse.json({ error: 'Proxy error' }, { status: 502 });
  }
}
