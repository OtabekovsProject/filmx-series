import { getAllMedia } from '@/lib/data';
import CatalogView from '@/components/CatalogView';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kino va Seriallar Katalogi — Barcha janrlar to'plami | FilmX",
  description: "FilmX katalogida 1,470+ dan ortiq tarjima kinolar, multfilmlar, dorama, jangari, melodrama, komediya, fantastika filmlar va ko'p qismli seriallarni bepul tomosha qiling.",
  keywords: [
    'kino katalogi',
    'seriallar katalogi',
    'tarjima kinolar royxati',
    'barcha filmlar',
    'filmx katalog',
    'janrlar boyicha kinolar'
  ],
  alternates: {
    canonical: 'https://filmx-series.vercel.app/catalog',
  },
  openGraph: {
    title: "Kino va Seriallar Katalogi — FilmX",
    description: "1,470+ tarjima kinolar va seriallar to'plami. Bepul 1080p Full HD va 4K sifatda tomosha qiling.",
    url: 'https://filmx-series.vercel.app/catalog',
    siteName: 'FilmX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kino va Seriallar Katalogi — FilmX",
    description: "Barcha tarjima kinolar va yangi seriallar to'plami.",
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
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
      name: 'Katalog',
      item: 'https://filmx-series.vercel.app/catalog',
    },
  ],
};

export default function CatalogPage() {

  const allItems = getAllMedia();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Suspense fallback={
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Katalog yuklanmoqda...</p>
        </div>
      }>
        <CatalogView initialItems={allItems} />
      </Suspense>
    </>
  );
}

