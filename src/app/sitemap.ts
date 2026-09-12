import { MetadataRoute } from 'next';
import { getMovies, getSeries } from '@/lib/data';

const BASE_URL = 'https://filmx-series.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const movies = getMovies();
  const series = getSeries();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const movieRoutes: MetadataRoute.Sitemap = movies.map((movie) => ({
    url: `${BASE_URL}/movie/${encodeURIComponent(movie.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = series.map((serie) => ({
    url: `${BASE_URL}/series/${encodeURIComponent(serie.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...movieRoutes, ...seriesRoutes];
}
