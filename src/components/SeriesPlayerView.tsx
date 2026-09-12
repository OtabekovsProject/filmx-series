'use client';

import { Series, Episode, MediaItem } from '@/types';
import VideoPlayer from '@/components/VideoPlayer';
import EpisodeSelector from '@/components/EpisodeSelector';
import MovieCard from '@/components/MovieCard';
import { useState, useMemo } from 'react';

interface SeriesPlayerViewProps {
  series: Series;
  relatedSeries: MediaItem[];
}

export default function SeriesPlayerView({ series, relatedSeries }: SeriesPlayerViewProps) {
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);
  const initialSeason = series.seasons[0] || { episodes: [] };
  const initialEpisode = initialSeason.episodes[0] || {
    id: '1-1',
    episodeNumber: 1,
    title: '1-Qism',
    videoUrl: ''
  };

  const [activeEpisode, setActiveEpisode] = useState<Episode>(initialEpisode);

  const handleSelectEpisode = (seasonIndex: number, episode: Episode) => {
    setActiveSeasonIndex(seasonIndex);
    setActiveEpisode(episode);
    // Smooth scroll to video player if on mobile
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  // Compute next episode info
  const nextEpisodeInfo = useMemo(() => {
    const currentSeason = series.seasons[activeSeasonIndex];
    if (!currentSeason) return null;

    const currentIndex = currentSeason.episodes.findIndex(e => e.id === activeEpisode.id);
    if (currentIndex >= 0 && currentIndex < currentSeason.episodes.length - 1) {
      const nextEp = currentSeason.episodes[currentIndex + 1];
      return {
        seasonIndex: activeSeasonIndex,
        episode: nextEp,
        title: `${currentSeason.seasonTitle} — ${nextEp.title}`
      };
    } else if (activeSeasonIndex < series.seasons.length - 1) {
      const nextSeason = series.seasons[activeSeasonIndex + 1];
      if (nextSeason.episodes.length > 0) {
        const nextEp = nextSeason.episodes[0];
        return {
          seasonIndex: activeSeasonIndex + 1,
          episode: nextEp,
          title: `${nextSeason.seasonTitle} — ${nextEp.title}`
        };
      }
    }
    return null;
  }, [series.seasons, activeSeasonIndex, activeEpisode.id]);

  const handleEpisodeEnded = () => {
    if (nextEpisodeInfo) {
      setActiveSeasonIndex(nextEpisodeInfo.seasonIndex);
      setActiveEpisode(nextEpisodeInfo.episode);
    }
  };

  return (
    <div className="player-page container">
      {/* Title & Info Header */}
      <div className="player-header">
        <div className="player-title-row">
          <div>
            <h1 className="player-title">{series.title}</h1>
            <div className="player-tags" style={{ marginTop: '8px' }}>
              <span className="tag-badge" style={{ background: 'var(--brand-gradient)' }}>SERIAL</span>
              <span className="tag-badge" style={{ background: 'rgba(0, 242, 254, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                {series.quality || '1080p Full HD'}
              </span>
              <span className="tag-badge">★ {series.rating.toFixed(1)}</span>
              <span>{series.year}-yil</span>
              <span>•</span>
              <span>{series.country}</span>
              <span>•</span>
              <span>{series.genres.join(', ')}</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                {series.totalSeasons || series.seasons.length} Fasl • {series.totalEpisodes} Qism
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Player with quality and countdown */}
      <VideoPlayer
        src={activeEpisode.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        poster={series.backdrop || series.poster}
        title={series.title}
        episodeTitle={`${series.seasons[activeSeasonIndex]?.seasonTitle || '1-Mavsum'} — ${activeEpisode.title}`}
        quality={activeEpisode.quality || series.quality || '1080p Full HD'}
        onEnded={handleEpisodeEnded}
        nextEpisodeTitle={nextEpisodeInfo?.title}
        mediaItem={series}
      />

      {/* Episodes & Seasons Interactive Navigator */}
      <EpisodeSelector
        seasons={series.seasons}
        activeSeasonIndex={activeSeasonIndex}
        activeEpisodeId={activeEpisode.id}
        onSelectEpisode={handleSelectEpisode}
      />

      {/* Series Details Grid */}
      <div className="movie-details-grid">
        <div className="details-poster">
          <img src={series.poster} alt={series.title} />
        </div>

        <div className="details-info">
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>
              Serial haqida:
            </h3>
            <p className="synopsis-text">{series.description}</p>
          </div>

          <div className="info-table">
            <div className="info-row">
              <span className="label">Nomi:</span>
              <span className="val">{series.title}</span>
            </div>
            <div className="info-row">
              <span className="label">Chiqarilgan yili:</span>
              <span className="val">{series.year}</span>
            </div>
            <div className="info-row">
              <span className="label">Davlat:</span>
              <span className="val">{series.country}</span>
            </div>
            <div className="info-row">
              <span className="label">Janr:</span>
              <span className="val">{series.genres.join(', ')}</span>
            </div>
            {series.actors && series.actors.length > 0 && (
              <div className="info-row">
                <span className="label">Bosh rollarda:</span>
                <span className="val">{series.actors.join(', ')}</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Fasllar soni:</span>
              <span className="val">{series.seasons.length} ta fasl</span>
            </div>
            <div className="info-row">
              <span className="label">Qismlar soni:</span>
              <span className="val">{series.totalEpisodes} ta to'liq qism</span>
            </div>
            <div className="info-row">
              <span className="label">Sifat standarti:</span>
              <span className="val" style={{ color: 'var(--accent-cyan)' }}>1080p Full HD (Tas-ix oqim)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Series Section */}
      {relatedSeries.length > 0 && (
        <section className="section" style={{ marginTop: '64px' }}>
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-indicator"></span>
              <h2 className="section-title">O'xshash Seriallar</h2>
            </div>
          </div>
          <div className="media-grid">
            {relatedSeries.slice(0, 6).map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
