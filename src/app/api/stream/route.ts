import { NextRequest, NextResponse } from 'next/server';
import dns from 'node:dns';
import { Agent, setGlobalDispatcher } from 'undici';

// Force IPv4 lookup to prevent IPv6 unreachable timeouts on external media CDNs
try {
  dns.setDefaultResultOrder('ipv4first');
  const agent = new Agent({
    connect: {
      family: 4,
      timeout: 10000,
    },
    keepAliveTimeout: 30000,
    keepAliveMaxTimeout: 60000,
  });
  setGlobalDispatcher(agent);
} catch {}

export const dynamic = 'force-dynamic';

interface CachedToken {
  signedUrl: string;
  expiresAt: number;
}

// Global in-memory cache for signed URLs to ensure zero-overhead seeking & range requests
const globalForStream = globalThis as unknown as {
  fayllarTokenCache?: Map<string, CachedToken>;
};

if (!globalForStream.fayllarTokenCache) {
  globalForStream.fayllarTokenCache = new Map<string, CachedToken>();
}

const tokenCache = globalForStream.fayllarTokenCache;

function normalizeFayllarUrl(rawUrl: string): string {
  let url = rawUrl.trim();

  // Convert old fayllar1.ru or raw IP mirrors to canonical fayllar.com format
  url = url.replace(/^https?:\/\/([0-9]+)\.fayllar1\.ru\/([0-9]+)\//i, 'https://fayllar.com/$2/');
  url = url.replace(/^https?:\/\/fayllar1\.ru\/([0-9]+)\//i, 'https://fayllar.com/$1/');
  url = url.replace(/^https?:\/\/83\.69\.139\.204\/hdd([0-9]+)\//i, 'https://fayllar.com/$1/');
  url = url.replace(/^https?:\/\/83\.69\.139\.204\/hdd\//i, 'https://fayllar.com/15/');
  url = url.replace(/^https?:\/\/([0-9]+)\.fayllar\.com\/([0-9]+)\//i, 'https://fayllar.com/$2/');

  // Ensure HTTPS
  if (url.startsWith('http://fayllar')) {
    url = url.replace('http://', 'https://');
  }

  return url;
}

async function signFayllarUrl(url: string, maxRetries = 3): Promise<string> {
  const normalized = normalizeFayllarUrl(url);

  // Check valid cache entry (valid for up to 6 hours)
  const cached = tokenCache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.signedUrl;
  }

  const signEndpoint = `https://asilmedia.org/fayllar-sign.php?u[]=${encodeURIComponent(normalized)}`;

  let lastError: any = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const signRes = await fetch(signEndpoint, {
        method: 'GET',
        headers: {
          'Referer': 'https://asilmedia.org/',
          'User-Agent': 'curl/8.18.0',
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!signRes.ok) {
        throw new Error(`Failed to sign URL: HTTP ${signRes.status}`);
      }

      const signData = await signRes.json();
      const signed = Object.values(signData)[0];

      if (!signed || typeof signed !== 'string') {
        throw new Error('Sign endpoint returned empty result');
      }

      // Cache token for 6 hours
      tokenCache.set(normalized, {
        signedUrl: signed,
        expiresAt: Date.now() + 6 * 3600 * 1000
      });

      return signed;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export async function GET(req: NextRequest) {
  return handleStream(req, 'GET');
}

export async function HEAD(req: NextRequest) {
  return handleStream(req, 'HEAD');
}

async function handleStream(req: NextRequest, method: 'GET' | 'HEAD') {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 });
  }

  const isFayllar = /fayllar(?:\.com|1\.ru)|\b83\.69\.139\.204\b/i.test(rawUrl);

  // Direct fast redirect for external non-protected streams (e.g., sample videos, open CDNs)
  if (!isFayllar && !rawUrl.includes('asilmedia')) {
    return NextResponse.redirect(rawUrl, { status: 307 });
  }

  try {
    let targetUrl: string;

    if (isFayllar) {
      try {
        targetUrl = await signFayllarUrl(rawUrl);
      } catch (signErr) {
        console.warn('First sign attempt failed, trying fallback normalized format:', signErr);
        // Fallback: if quality was changed (e.g. 720p), try falling back to 1080p
        const fallback1080 = rawUrl.replace(/720p|480p/gi, '1080p');
        targetUrl = await signFayllarUrl(fallback1080);
      }
    } else {
      targetUrl = rawUrl;
    }

    const rangeHeader = req.headers.get('range');
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'curl/8.18.0',
      'Referer': 'https://asilmedia.org/',
      'Accept': '*/*',
      'Accept-Encoding': 'identity'
    };

    if (rangeHeader) {
      upstreamHeaders['Range'] = rangeHeader;
    }

    const upstreamRes = await fetch(targetUrl, {
      method,
      headers: upstreamHeaders,
      cache: 'no-store'
    });

    const isDownload = searchParams.get('download') === '1' || searchParams.get('dl') === '1';
    let filename = 'filmx-video.mp4';
    try {
      const decodedPath = decodeURIComponent(new URL(targetUrl).pathname);
      const baseName = decodedPath.split('/').pop();
      if (baseName && baseName.endsWith('.mp4')) {
        filename = baseName;
      }
    } catch {}

    // If upstream returns 404 or 403 and the URL had 720p/480p, retry with 1080p
    if (!upstreamRes.ok && upstreamRes.status !== 206 && (rawUrl.includes('720p') || rawUrl.includes('480p'))) {
      const fallbackUrl = rawUrl.replace(/720p|480p/gi, '1080p');
      try {
        const fallbackSigned = await signFayllarUrl(fallbackUrl);
        const retryRes = await fetch(fallbackSigned, {
          method,
          headers: upstreamHeaders,
          cache: 'no-store'
        });

        if (retryRes.ok || retryRes.status === 206) {
          return buildStreamResponse(retryRes, method, isDownload, filename);
        }
      } catch {}
    }

    return buildStreamResponse(upstreamRes, method, isDownload, filename);
  } catch (error: any) {
    console.error('Video stream proxy error:', error);
    return NextResponse.json(
      { error: 'Video stream unavailable', details: error?.message || 'Unknown error' },
      { status: 502 }
    );
  }
}

function buildStreamResponse(upstreamRes: Response, method: 'GET' | 'HEAD', isDownload = false, filename = 'filmx-video.mp4') {
  const headers = new Headers();

  // Forward crucial streaming headers
  const passThrough = [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'last-modified',
    'etag'
  ];

  for (const h of passThrough) {
    const val = upstreamRes.headers.get(h);
    if (val) {
      headers.set(h, val);
    }
  }

  // Ensure default content type and Range acceptance for seeking
  if (!headers.has('content-type')) {
    headers.set('content-type', 'video/mp4');
  }
  headers.set('accept-ranges', 'bytes');
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-allow-methods', 'GET, HEAD, OPTIONS');
  headers.set('access-control-allow-headers', 'Range, Accept, Content-Type');
  headers.set('access-control-expose-headers', 'Content-Range, Content-Length, Accept-Ranges');
  headers.set('cache-control', 'public, max-age=86400, stale-while-revalidate=86400');

  if (isDownload) {
    headers.set('content-disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  }

  if (method === 'HEAD') {
    return new Response(null, {
      status: upstreamRes.status,
      headers
    });
  }

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers
  });
}
