import { NextResponse } from 'next/server';
import { getMovies, getSeries } from '@/lib/data';

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
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
