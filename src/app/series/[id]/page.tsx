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
  const description = item.description 
    ? `${item.title} (${item.year}) seriali barcha qismlari: ${item.description.slice(0, 160)}... Bepul 1080p Full HD sifatda FilmX portalida tomosha qiling.`
    : `${item.title} (${item.year}) serialining barcha qismlarini 1080p Full HD sifatda FilmX portalida bepul tomosha qiling. Janr: ${item.genres?.join(', ') || 'Serial'}.`;
  const canonicalUrl = `https://filmx-series.vercel.app/series/${encodeURIComponent(item.id)}`;

  return {
    title,
    description,
    keywords: [
      item.title,
      `${item.title} serial`,
      `${item.title} barcha qismlari`,
      `${item.title} uzbek tilida`,
      `${item.title} ${item.year}`,
      'filmx seriallar',
      ...(item.genres || [])
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'FilmX',
      type: 'video.tv_show',
      locale: 'uz_UZ',
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

  let targetSeries: Series;

  if (!item || item.type !== 'series') {
    const fallbackSeries = getSeries().find(s => s.id === id || s.id.includes(id));
    if (!fallbackSeries) {
      notFound();
    }
    targetSeries = fallbackSeries;
  } else {
    targetSeries = item as Series;
  }

  const candidates = getSeries().filter(s => s.id !== targetSeries.id);
  const matchingGenre = candidates.filter(s => 
    s.genres?.some(g => targetSeries.genres?.includes(g))
  );
  const matchingCountry = candidates.filter(s => 
    s.country && targetSeries.country && s.country.toLowerCase() === targetSeries.country.toLowerCase()
  );
  const relatedCandidates = [...matchingGenre, ...matchingCountry, ...candidates];
  const uniqueRelated = new Map<string, Series>();
  relatedCandidates.forEach(s => {
    if (!uniqueRelated.has(s.id)) uniqueRelated.set(s.id, s);
  });
  const allSeries = Array.from(uniqueRelated.values()).slice(0, 10);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TVSeries',
        '@id': `https://filmx-series.vercel.app/series/${encodeURIComponent(targetSeries.id)}#series`,
        url: `https://filmx-series.vercel.app/series/${encodeURIComponent(targetSeries.id)}`,
        name: targetSeries.title,
        alternateName: targetSeries.rawTitle,
        headline: `${targetSeries.title} (${targetSeries.year}) Barcha qismlar Uzbek tilida`,
        description: targetSeries.description || `${targetSeries.title} serialining barcha qismlarini bepul tomosha qiling.`,
        image: targetSeries.backdrop || targetSeries.poster,
        startDate: `${targetSeries.year}-01-01`,
        inLanguage: 'uz',
        genre: targetSeries.genres,
        numberOfEpisodes: targetSeries.totalEpisodes || 1,
        countryOfOrigin: targetSeries.country ? { '@type': 'Country', name: targetSeries.country } : undefined,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (targetSeries.rating || 8.6).toFixed(1),
          bestRating: '10',
          ratingCount: 160,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Bosh sahifa',
            item: 'https://filmx-series.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Seriallar',
            item: 'https://filmx-series.vercel.app/catalog?type=series',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: targetSeries.title,
            item: `https://filmx-series.vercel.app/series/${encodeURIComponent(targetSeries.id)}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeriesPlayerView series={targetSeries} relatedSeries={allSeries} />
    </>
  );
}

