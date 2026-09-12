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
  title: 'FilmX — Kinolar va Seriallar Portali (HD Uzbek tilida)',
  description: 'FilmX — barcha premyera kinolar, ko\'p qismli seriallar, hind va xorij filmlarini yuqori sifatda tomosha qiling.',
  keywords: ['FilmX', 'Seriallar', 'Tarjima kinolar', 'Uzbek tilida', 'HD kino', '1080p Full HD'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FilmX',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
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
                  if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes') {
                          var attr = m.attributeName;
                          if (attr === 'bis_skin_checked' || attr === 'bis_register' || (typeof attr === 'string' && attr.indexOf('__processed_') === 0)) {
                            m.target.removeAttribute(attr);
                          }
                        }
                      }
                    });
                    observer.observe(document.documentElement, {
                      attributes: true, subtree: true,
                      attributeFilter: ['bis_skin_checked', 'bis_register']
                    });
                  }
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
