import { getSeries, getMediaById } from '@/lib/data';
import { notFound } from 'next/navigation';
import SeriesPlayerView from '@/components/SeriesPlayerView';
import { Series } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
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
