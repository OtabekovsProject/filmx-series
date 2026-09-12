'use client';

import { useEffect, useState } from 'react';

export default function PwaRegister() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('FilmX: Yangi versiya yuklandi!');
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.error('FilmX ServiceWorker ro\'yxatdan o\'tishda xato:', err);
          });
      });
    }

    // In development mode, unregister existing service worker and purge cache so it doesn't serve old chunks
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        }).catch(() => {});
      }
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        }).catch(() => {});
      }
    }

    // 2. Offline / Online Status Listeners
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-toast" role="alert">
      <div className="offline-toast-inner">
        <span className="offline-toast-dot" />
        <span>Internet aloqasi yo&apos;q. Saqlangan kinolaringiz oflayn rejimda mavjud.</span>
      </div>
    </div>
  );
}
