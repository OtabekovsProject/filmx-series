import { NextResponse } from 'next/server';
import { getMovies, getSeries } from '@/lib/data';

// Zero-quota static generation: pre-renders as static JSON at build time
// Zero serverless function invocations on Vercel CDN
export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const movies = getMovies().map(m => ({
    id: m.id,
    type: m.type,
    title: m.title,
    poster: m.poster,
    year: m.year,
    rating: m.rating,
    genres: m.genres,
    country: m.country,
    quality: m.quality
  }));

  const series = getSeries().map(s => ({
    id: s.id,
    type: s.type,
    title: s.title,
    poster: s.poster,
    year: s.year,
    rating: s.rating,
    genres: s.genres,
    country: s.country,
    quality: s.quality,
    totalEpisodes: s.totalEpisodes
  }));

  return NextResponse.json({
    items: [...movies, ...series]
  }, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
    }
  });
}
