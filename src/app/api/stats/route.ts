import { NextResponse } from 'next/server';
import { getMovies, getSeries } from '@/lib/data';

export const dynamic = 'force-static';
export const revalidate = 300; // 5 minutes

export async function GET() {
  const movies = getMovies();
  const series = getSeries();

  const totalMovies = movies.length;
  const totalSeries = series.length;
  const totalEpisodes = series.reduce((sum, s) => sum + ((s as any).totalEpisodes || s.seasons?.reduce((eSum: number, sn: any) => eSum + (sn.episodes?.length || 0), 0) || 1), 0);

  // Realistic time-of-day active viewers calculation (Uzbekistan timezone UTC+5)
  const now = new Date();
  const utcHours = now.getUTCHours();
  const uzbHours = (utcHours + 5) % 24;

  let baseUsers = 1800;
  if (uzbHours >= 18 && uzbHours <= 23) {
    baseUsers = 3400 + Math.floor(Math.sin(uzbHours) * 600); // Prime evening peak
  } else if (uzbHours >= 12 && uzbHours < 18) {
    baseUsers = 2200 + Math.floor(Math.random() * 300);
  } else if (uzbHours >= 7 && uzbHours < 12) {
    baseUsers = 1400 + Math.floor(Math.random() * 200);
  } else {
    baseUsers = 850 + Math.floor(Math.random() * 150); // Night
  }

  return NextResponse.json({
    onlineUsers: baseUsers,
    totalMovies,
    totalSeries,
    totalEpisodes,
    totalMedia: totalMovies + totalSeries,
    status: 'online',
    lastSync: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
