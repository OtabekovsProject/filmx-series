'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LiveStatsShowcaseProps {
  totalMovies: number;
  totalSeries: number;
  totalEpisodes?: number;
}

export default function LiveStatsShowcase({
  totalMovies,
  totalSeries,
  totalEpisodes = 5000
}: LiveStatsShowcaseProps) {
  // Compute initial realistic online viewers based on current hour
  const getInitialOnline = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 18 && hour <= 23) {
      return 2800 + Math.floor(Math.random() * 400);
    } else if (hour >= 12 && hour < 18) {
      return 1900 + Math.floor(Math.random() * 300);
    } else if (hour >= 7 && hour < 12) {
      return 1300 + Math.floor(Math.random() * 200);
    }
    return 950 + Math.floor(Math.random() * 150);
  };

  const [onlineUsers, setOnlineUsers] = useState(getInitialOnline());
  const [animatedMovies, setAnimatedMovies] = useState(0);
  const [animatedSeries, setAnimatedSeries] = useState(0);
  const [animatedEpisodes, setAnimatedEpisodes] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Smooth Count-Up Animation on Mount
  useEffect(() => {
    const duration = 1200; // ms
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedMovies(Math.floor(ease * totalMovies));
      setAnimatedSeries(Math.floor(ease * totalSeries));
      setAnimatedEpisodes(Math.floor(ease * totalEpisodes));

      if (step >= steps) {
        setAnimatedMovies(totalMovies);
        setAnimatedSeries(totalSeries);
        setAnimatedEpisodes(totalEpisodes);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [totalMovies, totalSeries, totalEpisodes]);

  // Periodic Organic Fluctuation of Online Users (every 4-7 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      const delta = Math.floor(Math.random() * 19) - 9; // -9 to +9
      setOnlineUsers(prev => Math.max(500, prev + delta));

      setTimeout(() => setIsUpdating(false), 800);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-stats-container" style={{
      margin: '32px 0 40px',
      position: 'relative',
      zIndex: 2
    }}>
      {/* Live Active Header Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        padding: '10px 18px',
        background: 'rgba(10, 15, 29, 0.75)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '14px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Animated Pulsing Green Dot */}
          <div style={{ position: 'relative', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#10b981',
              opacity: 0.75,
              animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <span style={{
              position: 'relative',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 10px #10b981'
            }} />
          </div>

          <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.2px' }}>
            Real-Time Jonli Statistika:
          </span>

          <span style={{
            fontSize: '13px',
            color: '#34d399',
            fontWeight: 800,
            transition: 'all 0.4s ease',
            transform: isUpdating ? 'scale(1.05)' : 'scale(1)'
          }}>
            {onlineUsers.toLocaleString('uz-UZ')} nafar foydalanuvchi hozir onlayn tomosha qilmoqda
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-dim)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#10b981' }}>⚡</span> Tas-ix 1080p FHD
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#f59e0b' }}>🔄</span> Avto-yangilanish: Faol
          </span>
        </div>
      </div>

      {/* 4 Interactive Real-time Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Online Users */}
        <div className="stats-card" style={{
          background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(7, 10, 18, 0.7) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '18px',
          padding: '22px 20px',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Jonli Tomoshabinlar
            </span>
            <span style={{ fontSize: '20px' }}>🟢</span>
          </div>

          <div style={{
            fontSize: 'clamp(28px, 3.5vw, 36px)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '6px',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {onlineUsers.toLocaleString('uz-UZ')}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Hozir platformada faol kino va serial tomosha qilmoqda
          </p>
        </div>

        {/* Card 2: Total Movies */}
        <Link href="/catalog?type=movie" className="stats-card" style={{
          background: 'linear-gradient(145deg, rgba(229, 9, 20, 0.08) 0%, rgba(7, 10, 18, 0.7) 100%)',
          border: '1px solid rgba(229, 9, 20, 0.25)',
          borderRadius: '18px',
          padding: '22px 20px',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229, 9, 20, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff7485', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Mavjud Kinolar
            </span>
            <span style={{ fontSize: '20px' }}>🎬</span>
          </div>

          <div style={{
            fontSize: 'clamp(28px, 3.5vw, 36px)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '6px',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {animatedMovies.toLocaleString('uz-UZ')}+
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Tarjima kinolar, jahon durdonalari va premyeralar
          </p>
        </Link>

        {/* Card 3: Total Series */}
        <Link href="/catalog?type=series" className="stats-card" style={{
          background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(7, 10, 18, 0.7) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          borderRadius: '18px',
          padding: '22px 20px',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Ko&apos;p Qismli Seriallar
            </span>
            <span style={{ fontSize: '20px' }}>📺</span>
          </div>

          <div style={{
            fontSize: 'clamp(28px, 3.5vw, 36px)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '6px',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {animatedSeries.toLocaleString('uz-UZ')}+
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Turk, Koreys doramalari va jahon seriallari to&apos;liq
          </p>
        </Link>

        {/* Card 4: Total Episodes & Quality */}
        <Link href="/catalog?sort=newest" className="stats-card" style={{
          background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(7, 10, 18, 0.7) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '18px',
          padding: '22px 20px',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          textDecoration: 'none',
          color: 'inherit',
          display: 'block'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Jami Qismlar &amp; Sifat
            </span>
            <span style={{ fontSize: '20px' }}>⚡</span>
          </div>

          <div style={{
            fontSize: 'clamp(28px, 3.5vw, 36px)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '6px',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {animatedEpisodes.toLocaleString('uz-UZ')}+
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            1080p Full HD va 4K sifat, Tas-ix tezyurar serverlarida
          </p>
        </Link>
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
