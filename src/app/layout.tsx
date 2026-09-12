import type { Metadata, Viewport } from 'next';
import './globals.css';
import ConditionalLayout from '@/components/ConditionalLayout';
import PwaRegister from '@/components/PwaRegister';

export const viewport: Viewport = {
  themeColor: '#060913',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://filmx-series.vercel.app'),
  title: {
    default: 'FilmX — Kinolar va Seriallar Portali (HD Uzbek tilida)',
    template: '%s | FilmX'
  },
  description: 'FilmX — 930+ dan ortiq eng so\'nggi tarjima kinolar, ko\'p qismli premyera seriallar, hind, turk va jahon filmlarini 1080p Full HD sifatda bepul online tomosha qiling.',
  keywords: [
    'FilmX',
    'filmx series',
    'kinolar',
    'tarjima kinolar',
    'uzbek tilida kinolar',
    'seriallar',
    'seriallar 2025',
    'seriallar 2026',
    'premyera kinolar',
    'hind kinolari uzbek tilida',
    'turk seriallari uzbek tilida',
    'jangari kinolar',
    'komediya kinolar',
    'multfilmlar uzbek tilida',
    'bepul kino tomosha qilish',
    'online kinoteatr',
    'hd kinolar',
    '1080p full hd kino',
    'tas-ix kinolar'
  ],
  authors: [{ name: 'FilmX', url: 'https://filmx-series.vercel.app' }],
  creator: 'FilmX Team',
  publisher: 'FilmX Media',
  applicationName: 'FilmX',
  category: 'entertainment',
  classification: 'Cinema, Movies, TV Series, Entertainment',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  alternates: {
    canonical: 'https://filmx-series.vercel.app',
    languages: {
      'uz-UZ': 'https://filmx-series.vercel.app',
      'x-default': 'https://filmx-series.vercel.app',
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FilmX',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: 'https://filmx-series.vercel.app',
    siteName: 'FilmX',
    title: 'FilmX — Kinolar va Seriallar Portali (HD Uzbek tilida)',
    description: '930+ dan ortiq premyera kinolar, ko\'p qismli seriallar va multfilmlarni 1080p Full HD sifatda bepul tomosha qiling.',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'FilmX — Bepul onlayn kinoteatr',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FilmX — Kinolar va Seriallar Portali (HD)',
    description: '930+ premyera kinolar va seriallarni 1080p Full HD sifatda bepul tomosha qiling.',
    images: ['/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://filmx-series.vercel.app/#website',
      url: 'https://filmx-series.vercel.app',
      name: 'FilmX',
      alternateName: ['FilmX Series', 'FilmX Uzbek', 'Filmx-Series'],
      description: '930+ premyera kinolar va seriallarni 1080p Full HD sifatda bepul online tomosha qiling.',
      inLanguage: 'uz-UZ',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://filmx-series.vercel.app/catalog?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://filmx-series.vercel.app/#organization',
      name: 'FilmX',
      url: 'https://filmx-series.vercel.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://filmx-series.vercel.app/icons/icon-512x512.png',
        width: 512,
        height: 512,
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FilmX" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origSet = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked' || name === 'bis_register' || (typeof name === 'string' && name.indexOf('__processed_') === 0)) {
                      return;
                    }
                    return origSet.apply(this, arguments);
                  };
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <PwaRegister />
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
