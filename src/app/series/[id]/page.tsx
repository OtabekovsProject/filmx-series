import { getSeries, getMediaById } from '@/lib/data';
import { notFound } from 'next/navigation';
import SeriesPlayerView from '@/components/SeriesPlayerView';
import { Series } from '@/types';

import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getMediaById(id) || getSeries().find(s => s.id === id || s.id.includes(id));
  if (!item) {
    return { title: 'Serial topilmadi — FilmX' };
  }

  const title = `${item.title} (${item.year}) Barcha qismlar Uzbek tilida — FilmX`;
  const description = item.description || `${item.title} serialining barcha qismlarini 1080p Full HD sifatda FilmX portalida bepul tomosha qiling.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.tv_show',
      images: [
        {
          url: item.backdrop || item.poster,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [item.backdrop || item.poster],
    },
  };
}

export async function generateStaticParams() {
  const allSeries = getSeries();
  return allSeries.map((s) => ({ id: s.id }));
}

export default async function SeriesPage({ params }: PageProps) {
  const { id } = await params;
  const item = getMediaById(id);

  if (!item || item.type !== 'series') {
    // If not found or if the id corresponds to another format, check series list
    const fallbackSeries = getSeries().find(s => s.id === id || s.id.includes(id));
    if (!fallbackSeries) {
      notFound();
    }
    const allSeries = getSeries().filter(s => s.id !== fallbackSeries.id);
    return <SeriesPlayerView series={fallbackSeries} relatedSeries={allSeries} />;
  }

  const allSeries = getSeries().filter(s => s.id !== item.id);

  return <SeriesPlayerView series={item as Series} relatedSeries={allSeries} />;
}
