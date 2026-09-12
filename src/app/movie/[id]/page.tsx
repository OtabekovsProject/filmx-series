import { getMovies, getMediaById } from '@/lib/data';
import { notFound } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';

import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getMediaById(id) || getMovies().find(m => m.id === id || m.id.includes(id));
  if (!item) {
    return { title: 'Kino topilmadi — FilmX' };
  }

  const title = `${item.title} (${item.year}) Uzbek tilida tomosha qilish — FilmX`;
  const description = item.description 
    ? `${item.title} (${item.year}) Uzbek tilida: ${item.description.slice(0, 160)}... Bepul 1080p HD sifatda FilmX da tomosha qiling.`
    : `${item.title} (${item.year}) kinoni 1080p Full HD sifatda FilmX portalida bepul tomosha qiling. Janr: ${item.genres?.join(', ') || 'Kino'}.`;
  const canonicalUrl = `https://filmx-series.vercel.app/movie/${encodeURIComponent(item.id)}`;

  return {
    title,
    description,
    keywords: [
      item.title,
      `${item.title} uzbek tilida`,
      `${item.title} tarjima kino`,
      `${item.title} ${item.year}`,
      'filmx kino',
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
      type: 'video.movie',
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
  const movies = getMovies();
  return movies.map((m) => ({ id: m.id }));
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  const item = getMediaById(id);

  if (!item || item.type !== 'movie') {
    const fallbackMovie = getMovies().find(m => m.id === id || m.id.includes(id));
    if (!fallbackMovie) {
      notFound();
    }
    return <MoviePageView movie={fallbackMovie} />;
  }

  return <MoviePageView movie={item as Movie} />;
}

function MoviePageView({ movie }: { movie: Movie }) {
  const relatedMovies = getMovies()
    .filter(m => m.id !== movie.id)
    .slice(0, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Movie',
        '@id': `https://filmx-series.vercel.app/movie/${encodeURIComponent(movie.id)}#movie`,
        url: `https://filmx-series.vercel.app/movie/${encodeURIComponent(movie.id)}`,
        name: movie.title,
        alternateName: movie.rawTitle,
        headline: `${movie.title} (${movie.year}) Uzbek tilida tomosha qilish`,
        description: movie.description || `${movie.title} kinoni 1080p Full HD sifatda FilmX portalida bepul tomosha qiling.`,
        image: movie.backdrop || movie.poster,
        datePublished: `${movie.year}-01-01`,
        inLanguage: 'uz',
        genre: movie.genres,
        duration: movie.duration,
        countryOfOrigin: movie.country ? { '@type': 'Country', name: movie.country } : undefined,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (movie.rating || 8.5).toFixed(1),
          bestRating: '10',
          ratingCount: 145,
        },
        actor: (movie.actors || []).map(actor => ({
          '@type': 'Person',
          name: actor,
        })),
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
            name: 'Tarjima Kinolar',
            item: 'https://filmx-series.vercel.app/catalog?type=movie',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: movie.title,
            item: `https://filmx-series.vercel.app/movie/${encodeURIComponent(movie.id)}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="player-page container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="player-header">
        <div className="player-title-row">
          <div>
            <h1 className="player-title">{movie.title}</h1>
            <div className="player-tags" style={{ marginTop: '8px' }}>
              <span className="tag-badge" style={{ background: 'var(--brand-gradient)' }}>KINO</span>
              <span className="tag-badge">★ {movie.rating.toFixed(1)}</span>
              <span>{movie.year}-yil</span>
              <span>•</span>
              <span>{movie.duration || '2 soat'}</span>
              <span>•</span>
              <span>{movie.country}</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{movie.genres.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Player */}
      <VideoPlayer
        src={movie.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        poster={movie.backdrop || movie.poster}
        title={movie.title}
        quality={movie.quality || '1080p Full HD'}
        mediaItem={movie}
      />

      {/* Movie Details Grid */}
      <div className="movie-details-grid">
        <div className="details-poster">
          <img src={movie.poster} alt={movie.title} />
        </div>

        <div className="details-info">
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
              Film haqida:
            </h3>
            <p className="synopsis-text">{movie.description}</p>
          </div>

          <div className="info-table">
            <div className="info-row">
              <span className="label">Asl nomi:</span>
              <span className="val">{movie.rawTitle || movie.title}</span>
            </div>
            <div className="info-row">
              <span className="label">Chiqarilgan yili:</span>
              <span className="val">{movie.year}</span>
            </div>
            <div className="info-row">
              <span className="label">Davlat:</span>
              <span className="val">{movie.country}</span>
            </div>
            <div className="info-row">
              <span className="label">Davomiyligi:</span>
              <span className="val">{movie.duration || '2 soat 10 daq'}</span>
            </div>
            <div className="info-row">
              <span className="label">Janr:</span>
              <span className="val">{movie.genres.join(', ')}</span>
            </div>
            {movie.actors && movie.actors.length > 0 && (
              <div className="info-row">
                <span className="label">Bosh rollarda:</span>
                <span className="val">{movie.actors.join(', ')}</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Sifat:</span>
              <span className="val" style={{ color: 'var(--accent-cyan)' }}>Full HD 1080p (Tas-ix)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <section className="section" style={{ marginTop: '64px' }}>
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-indicator"></span>
              <h2 className="section-title">O'xshash Filmlar</h2>
            </div>
          </div>
          <div className="media-grid">
            {relatedMovies.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
