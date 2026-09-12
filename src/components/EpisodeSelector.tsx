'use client';

import { Season, Episode } from '@/types';
import { useState, useMemo } from 'react';

interface EpisodeSelectorProps {
  seasons: Season[];
  activeSeasonIndex: number;
  activeEpisodeId: string;
  onSelectEpisode: (seasonIndex: number, episode: Episode) => void;
}

export default function EpisodeSelector({
  seasons,
  activeSeasonIndex,
  activeEpisodeId,
  onSelectEpisode
}: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(activeSeasonIndex);
  const [searchFilter, setSearchFilter] = useState('');

  if (!seasons || seasons.length === 0) return null;

  const currentSeason = seasons[selectedSeason] || seasons[0];

  const filteredEpisodes = useMemo(() => {
    if (!searchFilter.trim()) return currentSeason.episodes;
    const q = searchFilter.toLowerCase().trim();
    return currentSeason.episodes.filter(ep => 
      ep.title.toLowerCase().includes(q) || 
      ep.episodeNumber.toString() === q
    );
  }, [currentSeason.episodes, searchFilter]);

  return (
    <div className="series-nav">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '18px'
      }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
            Serial qismlari va fasllari
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {seasons.length} ta fasl • {currentSeason.episodes.length} ta qism • Barchasi 1080p Full HD
          </span>
        </div>

        {/* Quick Episode Search for long series */}
        {currentSeason.episodes.length > 6 && (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Qism raqami (masalan: 5)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="search-input"
              style={{ width: '220px', padding: '8px 14px', fontSize: '13px', borderRadius: '8px' }}
            />
          </div>
        )}
      </div>

      {/* Season switcher tabs */}
      {seasons.length > 1 && (
        <div className="seasons-bar">
          {seasons.map((season, idx) => (
            <button
              key={season.seasonNumber}
              className={`season-btn ${selectedSeason === idx ? 'active' : ''}`}
              onClick={() => {
                setSelectedSeason(idx);
                setSearchFilter('');
              }}
            >
              {season.seasonTitle}
            </button>
          ))}
        </div>
      )}

      {/* Episodes list */}
      <div className="episodes-grid">
        {filteredEpisodes.map((ep) => {
          const isActive = ep.id === activeEpisodeId;
          return (
            <button
              key={ep.id}
              className={`episode-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectEpisode(selectedSeason, ep)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="ep-number">
                  {ep.episodeNumber}-QISM
                </span>
                <span style={{
                  background: 'rgba(0, 242, 254, 0.15)',
                  color: 'var(--accent-cyan)',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 242, 254, 0.3)'
                }}>
                  {ep.quality || '1080p FHD'}
                </span>
              </div>

              <span className="ep-title">{ep.title}</span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '6px' }}>
                <span className="ep-dur">{ep.duration || '45-60 daq'}</span>
                {isActive && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ▶ Ijroda
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredEpisodes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
          "{searchFilter}" raqamli qism topilmadi.
        </div>
      )}
    </div>
  );
}
