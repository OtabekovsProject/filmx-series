'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useWatchHistory } from '@/hooks/useWatchHistory';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  episodeTitle?: string;
  quality?: string;
  onEnded?: () => void;
  nextEpisodeTitle?: string;
  mediaItem?: any;
}

function optimizeVideoUrl(rawUrl?: string, selectedQuality: string = '1080p'): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (url.startsWith('file://')) return url;

  url = url.replace(/^https?:\/\/83\.69\.139\.204\/hdd(\d+)\//i, (m, p1) => `https://${p1}.fayllar1.ru/${p1}/`);
  url = url.replace(/^https?:\/\/83\.69\.139\.204\/hdd\//i, 'https://15.fayllar1.ru/15/');
  url = url.replace(/^https?:\/\/fayllar1\.ru\/([^/]+)\//i, (m, p1) => `https://${p1}.fayllar1.ru/${p1}/`);

  if (selectedQuality.includes('720p')) {
    url = url.replace(/1080p/gi, '720p');
  } else if (selectedQuality.includes('480p')) {
    url = url.replace(/1080p|720p/gi, '480p');
  } else if (selectedQuality.includes('1080p')) {
    url = url.replace(/720p|480p/gi, '1080p');
  }

  try {
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname
      .split('/')
      .map((part) => {
        try {
          return encodeURIComponent(decodeURIComponent(part))
            .replace(/%28/g, '(')
            .replace(/%29/g, ')')
            .replace(/%27/g, "'");
        } catch {
          return encodeURIComponent(part);
        }
      })
      .join('/');
    return parsed.toString();
  } catch {
    try {
      return encodeURI(decodeURI(url));
    } catch {
      return encodeURI(url);
    }
  }
}

export default function VideoPlayer({
  src,
  poster,
  title,
  episodeTitle,
  quality = '1080p Full HD',
  onEnded,
  nextEpisodeTitle,
  mediaItem
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { recordProgress, markAsWatched, isWatched, getProgress } = useWatchHistory();

  const [currentSrc, setCurrentSrc] = useState(() => optimizeVideoUrl(src, quality));
  const [hasError, setHasError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState(quality);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Resume progress state
  const [savedResumeTime, setSavedResumeTime] = useState<number | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [autoNext, setAutoNext] = useState(true);

  // Skip & Volume On-screen HUD state
  const [hudNotice, setHudNotice] = useState<{ text: string; side: 'left' | 'right' | 'center' } | null>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sleep timer state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);

  // Mobile touch double-tap state
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<{ side: 'left' | 'right'; id: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);

  const watched = mediaItem ? isWatched(mediaItem.id) : false;

  const showHud = (text: string, side: 'left' | 'right' | 'center' = 'center') => {
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    setHudNotice({ text, side });
    hudTimeoutRef.current = setTimeout(() => {
      setHudNotice(null);
    }, 1000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Restore saved volume and playback rate
  useEffect(() => {
    try {
      const savedVol = localStorage.getItem('filmx_player_volume');
      if (savedVol && videoRef.current) {
        const v = parseFloat(savedVol);
        if (!isNaN(v)) videoRef.current.volume = v;
      }
      const savedSpd = localStorage.getItem('filmx_player_speed');
      if (savedSpd && videoRef.current) {
        const s = parseFloat(savedSpd);
        if (!isNaN(s)) {
          videoRef.current.playbackRate = s;
          setPlaybackSpeed(s);
        }
      }
      const savedAuto = localStorage.getItem('filmx_auto_next');
      if (savedAuto !== null) {
        setAutoNext(savedAuto === 'true');
      }
    } catch {}
  }, []);

  // Check for resume progress on media load
  useEffect(() => {
    if (!mediaItem) return;
    const prog = getProgress(mediaItem.id);
    if (prog && prog.currentTime > 15 && prog.progressPercent < 90) {
      setSavedResumeTime(prog.currentTime);
      setShowResumeBanner(true);
    } else {
      setShowResumeBanner(false);
    }
  }, [mediaItem, getProgress]);

  const handleResumePlayback = () => {
    if (videoRef.current && savedResumeTime) {
      videoRef.current.currentTime = savedResumeTime;
      videoRef.current.play();
      setShowResumeBanner(false);
      showToast(`Playback davom ettirildi: ${formatTime(savedResumeTime)}`);
    }
  };

  const handleDismissResume = () => {
    setShowResumeBanner(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    setCurrentSrc(optimizeVideoUrl(src, selectedQuality));
    setHasError(false);
    setShowNextOverlay(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src, selectedQuality]);

  // Countdown timer for next episode auto-play
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showNextOverlay && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showNextOverlay && countdown === 0) {
      setShowNextOverlay(false);
      if (onEnded) onEnded();
    }
    return () => clearTimeout(timer);
  }, [showNextOverlay, countdown, onEnded]);

  // Sleep timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sleepTimerSecondsLeft !== null && sleepTimerSecondsLeft > 0) {
      interval = setInterval(() => {
        setSleepTimerSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (sleepTimerSecondsLeft === 0) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setSleepTimerMinutes(null);
      setSleepTimerSecondsLeft(null);
      showToast('⏰ Taymer tugadi: Video to\'xtatildi');
    }
    return () => clearInterval(interval);
  }, [sleepTimerSecondsLeft]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepTimerSecondsLeft(null);
      showToast('⏰ Taymer o\'chirildi');
    } else {
      setSleepTimerSecondsLeft(minutes * 60);
      showToast(`⏰ Taymer o'rnatildi: ${minutes} daqiqa`);
    }
  };

  // Watch history progress tracking
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !mediaItem) return;
    const ct = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    if (dur > 0 && Math.floor(ct) % 5 === 0) {
      recordProgress(mediaItem, ct, dur, episodeTitle, episodeTitle);
    }
  }, [mediaItem, episodeTitle, recordProgress]);

  const skipTime = (seconds: number, side: 'left' | 'right' = 'center' as any) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      showHud(seconds > 0 ? `+${seconds}s ⏩` : `⏪ ${seconds}s`, side);
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showToast('PiP oynasi yopildi');
      } else {
        await videoRef.current.requestPictureInPicture();
        showToast('PiP kichik oyna yoqildi');
      }
    } catch (e: any) {
      console.warn('PiP error', e);
      showToast('Brauzeringiz PiP rejimini qo\'llab-quvvatlamadi');
    }
  };

  // Keyboard Shortcuts: Space, F, M, P, Left, Right, Up, Down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Only intercept Space, Up, Down if player is focused, hovered or in fullscreen
      const isPlayerActive = 
        Boolean(document.fullscreenElement) ||
        Boolean(containerRef.current?.matches(':hover')) ||
        Boolean(containerRef.current?.contains(document.activeElement));

      if (e.code === 'Space') {
        if (!isPlayerActive) return;
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            showHud('▶ Ijro');
          } else {
            videoRef.current.pause();
            showHud('⏸ Pauza');
          }
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (containerRef.current) {
          if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
          showHud(videoRef.current.muted ? '🔇 Ovoz o\'chiq' : '🔊 Ovoz yoqildi');
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePiP();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-10, 'left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipTime(10, 'right');
      } else if (e.key === 'ArrowUp') {
        if (!isPlayerActive) return;
        e.preventDefault();
        if (videoRef.current) {
          const newVol = Math.min(1, Math.round((videoRef.current.volume + 0.1) * 10) / 10);
          videoRef.current.volume = newVol;
          try { localStorage.setItem('filmx_player_volume', newVol.toString()); } catch {}
          showHud(`🔊 Ovoz: ${Math.round(newVol * 100)}%`);
        }
      } else if (e.key === 'ArrowDown') {
        if (!isPlayerActive) return;
        e.preventDefault();
        if (videoRef.current) {
          const newVol = Math.max(0, Math.round((videoRef.current.volume - 0.1) * 10) / 10);
          videoRef.current.volume = newVol;
          try { localStorage.setItem('filmx_player_volume', newVol.toString()); } catch {}
          showHud(`🔉 Ovoz: ${Math.round(newVol * 100)}%`);
        }
      } else if (e.key === '?') {
        setShowShortcutsModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQualityChange = (q: string) => {
    setSelectedQuality(q);
    const prevTime = videoRef.current ? videoRef.current.currentTime : 0;
    const wasPlaying = videoRef.current ? !videoRef.current.paused : false;
    const nextUrl = optimizeVideoUrl(src, q);
    setCurrentSrc(nextUrl);
    showToast(`Sifat: ${q} o'rnatildi`);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = prevTime;
        if (wasPlaying) videoRef.current.play().catch(() => {});
      }
    }, 150);
  };

  const handleVideoError = () => {
    if (!selectedQuality.includes('1080p')) {
      setSelectedQuality('1080p Full HD');
      setCurrentSrc(optimizeVideoUrl(src, '1080p Full HD'));
      showToast("Asl sifatga o'tildi (1080p)");
      return;
    }
    setHasError(true);
    setCurrentSrc('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  };

  const handleEnded = () => {
    if (nextEpisodeTitle) {
      if (autoNext) {
        setShowNextOverlay(true);
        setCountdown(5);
      } else {
        showToast('Qism yakunlandi. Keyingi qismni tanlang.');
      }
    } else if (onEnded) {
      onEnded();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      showHud(`${speed}x Tezlik`);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('✓ Havola nusxalandi!');
    }
  };

  const handleTelegramShare = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`FilmX — "${title}" filmini tomosha qiling (1080p FHD O'zbek tilida):`);
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    }
  };

  const handleToggleWatched = () => {
    if (!mediaItem) return;
    markAsWatched(mediaItem);
    showToast('✓ Ko\'rilgan deb belgilandi!');
  };

  const toggleFullscreen = () => {
    const el = containerRef.current as any;
    const vid = videoRef.current as any;
    if (!el && !vid) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (vid.webkitEnterFullscreen) {
        // iOS Safari native fullscreen on video element
        vid.webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Video container click handler for double-click skip (Desktop)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.detail === 2) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      if (x < width * 0.35) {
        skipTime(-10, 'left');
      } else if (x > width * 0.65) {
        skipTime(10, 'right');
      } else {
        toggleFullscreen();
      }
    }
  };

  // Mobile Touch Double-Tap Handler (10s back / 10s forward with HUD animation)
  const handleTouchTap = (e: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const touch = e.changedTouches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;

    if (lastTapRef.current && (now - lastTapRef.current.time < 320)) {
      // It's a double tap
      if (x < width * 0.4) {
        skipTime(-10, 'left');
        setDoubleTapFeedback({ side: 'left', id: now });
        setTimeout(() => setDoubleTapFeedback(null), 650);
      } else if (x > width * 0.6) {
        skipTime(10, 'right');
        setDoubleTapFeedback({ side: 'right', id: now });
        setTimeout(() => setDoubleTapFeedback(null), 650);
      } else {
        toggleFullscreen();
      }
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, x };
    }
  };

  return (
    <>
      {/* Cinema Mode Dimmer */}
      {isCinemaMode && (
        <div
          onClick={() => setIsCinemaMode(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.94)',
            zIndex: 90,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '14px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
          zIndex: 9999,
          fontWeight: 700,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'toastIn 0.25s ease forwards'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: isCinemaMode ? 95 : 1,
        transition: 'all 0.3s ease',
        maxWidth: isTheaterMode ? '100%' : '1100px',
        margin: '0 auto',
      }}>
        {/* Ambient Cinema Glow */}
        {poster && (
          <div
            className="player-ambient-glow"
            style={{
              backgroundImage: `url(${poster})`,
              opacity: isCinemaMode ? 0.6 : 0.35,
            }}
          />
        )}

        {/* Resume Playback Banner */}
        {showResumeBanner && savedResumeTime && (
          <div className="resume-prompt-banner">
            <span style={{ fontSize: '18px' }}>⏱️</span>
            <span className="resume-text">
              Oxirgi to&apos;xtagan joyingiz: <strong>{Math.floor(savedResumeTime / 60)}:{Math.floor(savedResumeTime % 60) < 10 ? '0' : ''}{Math.floor(savedResumeTime % 60)}</strong>
            </span>
            <button onClick={handleResumePlayback} className="resume-btn-confirm">
              Davom ettirish ▶
            </button>
            <button
              onClick={() => setShowResumeBanner(false)}
              className="resume-btn-dismiss"
              title="Yopish"
            >
              ✕
            </button>
          </div>
        )}

        {/* Video Frame */}
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          onTouchEnd={handleTouchTap}
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: '#000',
            boxShadow: isCinemaMode
              ? '0 0 100px rgba(229, 9, 20, 0.5), 0 20px 60px rgba(0,0,0,0.9)'
              : '0 12px 40px rgba(0,0,0,0.6)',
            marginBottom: '16px',
            aspectRatio: '16/9',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer'
          }}
        >
          {/* Double-tap ripple overlays */}
          {doubleTapFeedback?.side === 'left' && (
            <div className="player-double-tap-zone left">
              <div className="player-seek-ripple">
                <span style={{ fontSize: '20px' }}>⏪</span>
                <span>-10s</span>
              </div>
            </div>
          )}
          {doubleTapFeedback?.side === 'right' && (
            <div className="player-double-tap-zone right">
              <div className="player-seek-ripple">
                <span style={{ fontSize: '20px' }}>⏩</span>
                <span>+10s</span>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            src={currentSrc}
            poster={poster}
            controls
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onError={handleVideoError}
            onEnded={handleEnded}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'contain',
              background: '#000'
            }}
          />

          {/* On-screen HUD Indicator (Skip / Volume / Pause) */}
          {hudNotice && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: hudNotice.side === 'left' ? '15%' : hudNotice.side === 'right' ? '85%' : '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(7, 10, 18, 0.85)',
              border: '1px solid var(--brand-primary)',
              boxShadow: '0 0 30px rgba(229,9,20,0.5)',
              color: '#fff',
              padding: '14px 24px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 800,
              pointerEvents: 'none',
              zIndex: 30,
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'hudPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}>
              {hudNotice.text}
            </div>
          )}

          {/* Next Episode Overlay */}
          {showNextOverlay && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 10, 18, 0.94)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              padding: '24px',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '8px'
              }}>
                Keyingi qism boshlanmoqda:
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
                {nextEpisodeTitle}
              </h3>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '3px solid var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '20px'
              }}>
                {countdown}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowNextOverlay(false);
                    if (onEnded) onEnded();
                  }}
                  className="btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  Hozir o'tish
                </button>
                <button
                  onClick={() => setShowNextOverlay(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px' }}
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          )}

          {hasError && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(229, 9, 20, 0.9)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              Oqim almashtirildi (Tas-ix Zaxira)
            </div>
          )}
        </div>

        {/* Enhanced Player Controls Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'var(--bg-card)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {title} {episodeTitle && <span style={{ color: 'var(--brand-primary)' }}>• {episodeTitle}</span>}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '13px', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
              <span>Tas-ix yuqori tezlik</span>
              <span>•</span>
              <span style={{ color: '#10b981' }}>Reklamasiz toza oqim</span>
              <span>•</span>
              <span style={{ color: 'var(--text-muted)' }}>Hotkeys: Space, F, M, P, ←, →, ↑, ↓</span>
              {sleepTimerSecondsLeft !== null && (
                <>
                  <span>•</span>
                  <span style={{ color: '#ffb703', fontWeight: 700 }}>
                    ⏰ Taymer: {Math.floor(sleepTimerSecondsLeft / 60)}m {sleepTimerSecondsLeft % 60}s
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="player-controls-toolbar">
            {/* Left Group: Navigation & Media settings */}
            <div className="player-toolbar-group player-toolbar-left">
              {/* Skip 10s */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => skipTime(-10, 'left')}
                  className="player-tool-btn"
                  title="10s orqaga (←)"
                >
                  ⏪ -10s
                </button>
                <button
                  onClick={() => skipTime(10, 'right')}
                  className="player-tool-btn"
                  title="10s oldinga (→)"
                >
                  +10s ⏩
                </button>
              </div>

              {/* Quality Selector */}
              <div className="player-pill-group">
                <span className="player-pill-label">Sifat:</span>
                {['1080p FHD', '720p HD', '480p'].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQualityChange(q)}
                    className={`player-pill-btn ${selectedQuality.includes(q.split(' ')[0]) ? 'active' : ''}`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Speed Selector */}
              <div className="player-pill-group">
                <span className="player-pill-label">Tezlik:</span>
                {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`player-pill-btn ${playbackSpeed === s ? 'active' : ''}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Auto Next Episode Toggle for series & multfilms */}
              {nextEpisodeTitle && (
                <button
                  onClick={() => {
                    const nextVal = !autoNext;
                    setAutoNext(nextVal);
                    try { localStorage.setItem('filmx_auto_next', nextVal ? 'true' : 'false'); } catch {}
                    showToast(nextVal ? '▶ Keyingi qismga avto-o\'tish: Yoqildi' : '⏸ Keyingi qismga avto-o\'tish: O\'chirildi');
                  }}
                  className={`player-tool-btn ${autoNext ? 'cinema-active' : ''}`}
                  title="Keyingi qismga avtomatik o'tish sozlamasi"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: autoNext ? '#10b981' : '#6b7280', display: 'inline-block' }} />
                  Avto-o&apos;tish: {autoNext ? 'Faol' : 'O\'chiq'}
                </button>
              )}
            </div>

            {/* Right Group: Display Modes & Actions */}
            <div className="player-toolbar-group player-toolbar-right">
              {/* Picture in Picture Button */}
              <button
                onClick={togglePiP}
                className="player-tool-btn"
                title="Kichik oyna (Picture-in-Picture / P)"
              >
                📺 PiP
              </button>

              {/* Sleep Timer Dropdown */}
              <select
                value={sleepTimerMinutes === null ? '' : sleepTimerMinutes.toString()}
                onChange={(e) => setSleepTimer(e.target.value ? parseInt(e.target.value) : null)}
                className="player-tool-select"
                title="Avto-o'chirish taymeri"
              >
                <option value="">⏰ Taymer: O'chiq</option>
                <option value="15">⏰ 15 daqiqa</option>
                <option value="30">⏰ 30 daqiqa</option>
                <option value="45">⏰ 45 daqiqa</option>
                <option value="60">⏰ 60 daqiqa</option>
              </select>

              {/* Mark as Watched */}
              {mediaItem && (
                <button
                  onClick={handleToggleWatched}
                  className={`player-tool-btn ${watched ? 'watched-active' : ''}`}
                  title={watched ? "Ko'rilgan asar" : "Ko'rilgan deb belgilash"}
                >
                  {watched ? '✓ Ko\'rildi' : '○ Ko\'rildi deb belgilash'}
                </button>
              )}

              {/* Fullscreen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                className="player-tool-btn"
                title="To'liq ekran rejimi (F)"
              >
                ⛶ To&apos;liq ekran
              </button>

              {/* Theater Mode Toggle */}
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className={`player-tool-btn ${isTheaterMode ? 'theater-active' : ''}`}
                title="Keng ekran / Teatr rejimi"
              >
                📺 {isTheaterMode ? 'Ixcham' : 'Keng ekran'}
              </button>

              {/* Cinema mode toggle */}
              <button
                onClick={() => setIsCinemaMode(!isCinemaMode)}
                className={`player-tool-btn ${isCinemaMode ? 'cinema-active' : ''}`}
                title="Kino zali rejimi (Fonni qoraytirish)"
              >
                🎬 {isCinemaMode ? 'Zalni ochish' : 'Kino zali'}
              </button>

              {/* Telegram share */}
              <button
                onClick={handleTelegramShare}
                className="player-tool-btn telegram-share-btn"
                title="Telegram orqali ulashish"
              >
                ✈️ Telegram
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="player-tool-btn"
                title="Havolani nusxalash"
              >
                🔗 Havola
              </button>

              {/* Keyboard shortcuts helper button */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="player-tool-btn"
                title="Tezkor tugmalar ro'yxati (?)"
              >
                ⌨️ Tugmalar
              </button>

              {/* Direct Download Button */}
              {src && (
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="player-tool-btn"
                  title="To'g'ridan-to'g'ri yuklab olish"
                >
                  📥 Yuklash
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          onClick={() => setShowShortcutsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(229,9,20,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⌨️</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                  Tezkor Tugmalar (Hotkeys)
                </h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#fff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'Space', desc: 'Ijro / Pauza (Play / Pause)' },
                { key: 'F', desc: 'To\'liq ekran (Fullscreen)' },
                { key: 'M', desc: 'Ovozni o\'chirish / yoqish (Mute)' },
                { key: 'P', desc: 'Kichik suzuvchi oyna (Picture-in-Picture)' },
                { key: '← / →', desc: '10 soniya orqaga / oldinga' },
                { key: '↑ / ↓', desc: 'Ovozni ko\'tarish / pasaytirish' },
                { key: '?', desc: 'Ushbu yordamchi darchani ochish' },
              ].map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>{s.desc}</span>
                  <kbd style={{ background: 'rgba(229,9,20,0.18)', border: '1px solid rgba(229,9,20,0.35)', color: '#ff7485', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-sm)' }}
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </>
  );
}
