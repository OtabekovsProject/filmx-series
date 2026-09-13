import { NextRequest, NextResponse } from 'next/server';
import { getMovies, getSeries } from '@/lib/data';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface VisitorSession {
  ip: string;
  visitorId?: string;
  lastSeen: number;
}

const ACTIVE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes active window
const SESSIONS_FILE = path.join('/tmp', 'filmx_active_ips.json');

// In-memory global store to keep track across requests
const globalForStats = globalThis as unknown as {
  activeVisitorSessions?: Map<string, VisitorSession>;
};

if (!globalForStats.activeVisitorSessions) {
  globalForStats.activeVisitorSessions = new Map<string, VisitorSession>();
}

const sessionsMap = globalForStats.activeVisitorSessions;

function loadSessionsFromFile() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      const now = Date.now();
      for (const [key, val] of Object.entries(data as Record<string, VisitorSession>)) {
        if (now - val.lastSeen < ACTIVE_TIMEOUT_MS) {
          sessionsMap.set(key, val);
        }
      }
    }
  } catch {}
}

function persistSessionsToFile() {
  try {
    const obj: Record<string, VisitorSession> = {};
    for (const [k, v] of sessionsMap.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj), 'utf-8');
  } catch {}
}

// Initial load
loadSessionsFromFile();

function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

function processTracking(req: NextRequest, visitorId?: string) {
  const clientIp = extractClientIp(req);
  const now = Date.now();

  // On localhost/internal IPs, use visitorId suffix so multiple test browsers on same machine count properly
  const isLocal = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.');
  const sessionKey = isLocal && visitorId ? `${clientIp}_${visitorId}` : clientIp;

  sessionsMap.set(sessionKey, {
    ip: clientIp,
    visitorId,
    lastSeen: now
  });

  // Prune expired IPs/sessions older than 3 minutes
  for (const [key, session] of sessionsMap.entries()) {
    if (now - session.lastSeen > ACTIVE_TIMEOUT_MS) {
      sessionsMap.delete(key);
    }
  }

  persistSessionsToFile();

  const movies = getMovies();
  const series = getSeries();

  const totalMovies = movies.length;
  const totalSeries = series.length;
  const totalEpisodes = series.reduce((sum, s) => sum + ((s as any).totalEpisodes || s.seasons?.reduce((eSum: number, sn: any) => eSum + (sn.episodes?.length || 0), 0) || 1), 0);

  // Real count of distinct active visitors / IPs
  const realOnlineCount = Math.max(1, sessionsMap.size);

  return {
    onlineUsers: realOnlineCount,
    activeIpsCount: sessionsMap.size,
    clientIp: isLocal ? 'Localhost / Dev' : clientIp.replace(/\.\d+$/, '.***'), // privacy masked
    totalMovies,
    totalSeries,
    totalEpisodes,
    totalMedia: totalMovies + totalSeries,
    status: 'online',
    timestamp: new Date().toISOString()
  };
}

export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get('vid') || undefined;
  const stats = processTracking(req, visitorId);

  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'Content-Type': 'application/json'
    }
  });
}

export async function POST(req: NextRequest) {
  let visitorId: string | undefined;
  try {
    const body = await req.json();
    visitorId = body?.visitorId;
  } catch {}

  const stats = processTracking(req, visitorId);

  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'Content-Type': 'application/json'
    }
  });
}
