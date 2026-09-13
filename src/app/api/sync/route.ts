import { NextRequest, NextResponse } from 'next/server';
import { getMovies, getSeries } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const movies = getMovies();
  const series = getSeries();
  const includeFull = req.nextUrl.searchParams.get('full') === '1';

  const manifest = {
    version: '1.6.0',
    totalMovies: movies.length,
    totalSeries: series.length,
    totalMedia: movies.length + series.length,
    timestamp: new Date().toISOString(),
    status: 'ok',
  };

  if (includeFull) {
    return NextResponse.json({
      ...manifest,
      movies,
      series,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      }
    });
  }

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'Content-Type': 'application/json',
    }
  });
}
