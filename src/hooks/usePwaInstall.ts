'use client';

import { useState, useEffect } from 'react';

let globalDeferredPrompt: any = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  // Listen once globally to beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    listeners.forEach((listener) => listener());
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    listeners.forEach((listener) => listener());
  });
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setCanInstall(false);
      return;
    }

    const update = () => {
      setCanInstall(!!globalDeferredPrompt);
    };

    listeners.add(update);
    update();

    return () => {
      listeners.delete(update);
    };
  }, []);

  const promptInstall = async () => {
    if (!globalDeferredPrompt) return false;
    try {
      globalDeferredPrompt.prompt();
      const choice = await globalDeferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        globalDeferredPrompt = null;
        setCanInstall(false);
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
    return false;
  };

  return { canInstall, promptInstall };
}
