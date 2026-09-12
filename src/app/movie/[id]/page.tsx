import { getMovies, getMediaById } from '@/lib/data';
import { notFound } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
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

  return (
    <div className="player-page container">
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
