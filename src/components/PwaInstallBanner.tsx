'use client';

import { useState, useEffect } from 'react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const { canInstall, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Only show if not previously dismissed in this session
    try {
      const isDismissed = sessionStorage.getItem('filmx_pwa_dismissed');
      if (!isDismissed) {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await promptInstall();
    } finally {
      setIsInstalling(false);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('filmx_pwa_dismissed', 'true');
    } catch {}
  };

  return (
    <aside
      className="pwa-install-banner"
      role="banner"
      aria-label="FilmX ilovasini o'rnatish taklifi"
      style={{
        position: 'fixed',
        bottom: '84px',
        left: '16px',
        right: '16px',
        maxWidth: '480px',
        margin: '0 auto',
        zIndex: 9990,
        background: 'linear-gradient(135deg, rgba(13, 17, 32, 0.96) 0%, rgba(20, 10, 24, 0.96) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.35)',
        borderRadius: '18px',
        padding: '14px 16px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 242, 254, 0.15)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        animation: 'pwaSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Icon */}
      <img
        src="/icons/icon-192x192.png"
        alt="FilmX"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: '0 0 16px rgba(229, 9, 20, 0.4)',
        }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.2px',
            }}
          >
            FilmX Ilovasini O&apos;rnating
          </h4>
          <span
            style={{
              background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
              color: '#000',
              fontSize: '9px',
              fontWeight: 900,
              padding: '1px 6px',
              borderRadius: '6px',
              letterSpacing: '0.4px',
            }}
          >
            PWA
          </span>
        </div>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Tezroq ochiladi va to&apos;liq ekranda qulay tomosha qilasiz
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          style={{
            background: 'linear-gradient(135deg, #e50914 0%, #ff385c 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '999px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(229, 9, 20, 0.5)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'transform 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{isInstalling ? 'Yuklanmoqda...' : "O'rnatish"}</span>
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Yopish"
          title="Keyinroq"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '13px',
            padding: 0,
          }}
        >
          ✕
        </button>
      </div>

      <style jsx>{`
        @keyframes pwaSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (min-width: 768px) {
          .pwa-install-banner {
            bottom: 24px !important;
            right: 24px !important;
            left: auto !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </aside>
  );
}
