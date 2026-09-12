import Link from 'next/link';

const FOOTER_LINKS = {
  'Kategoriyalar': [
    { label: 'Seriallar', href: '/catalog?type=series' },
    { label: 'Tarjima Kinolar', href: '/catalog?type=movie' },
    { label: 'Hind kinolari', href: '/catalog?genre=hind' },
    { label: 'AQSH kinolari', href: '/catalog?genre=aqsh' },
    { label: 'Koreya', href: '/catalog?genre=koreya' },
    { label: 'Jangari', href: '/catalog?genre=jangari' },
  ],
  'Janrlar': [
    { label: 'Drama', href: '/catalog?genre=drama' },
    { label: 'Komediya', href: '/catalog?genre=komediya' },
    { label: 'Triller', href: '/catalog?genre=triller' },
    { label: 'Fantastika', href: '/catalog?genre=fantastika' },
    { label: 'Animatsiya', href: '/catalog?genre=animatsiya' },
  ],
  'Sayt': [
    { label: 'Bosh sahifa', href: '/' },
    { label: 'Katalog', href: '/catalog' },
    { label: 'Sevimlilar', href: '/favorites' },
    { label: 'Yangi Premyeralar', href: '/catalog?type=movie' },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Top Row */}
        <div className="footer-inner">
          {/* Brand */}
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '26px',
                fontWeight: 900,
                letterSpacing: '-1.5px',
                background: 'linear-gradient(135deg, #e50914 0%, #8b5cf6 50%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>FilmX</span>
              <span style={{
                background: 'linear-gradient(135deg, #e50914, #ff385c)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 900,
                padding: '3px 9px',
                borderRadius: '6px',
                letterSpacing: '1px',
                boxShadow: '0 0 12px rgba(229,9,20,0.4)',
              }}>SERIES</span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-dim)', marginBottom: '20px' }}>
              FilmX Series — 918+ ta kino va seriallarni 1080p Full HD sifatda,
              o&apos;zbek tilida tarjima qilingan holda tomosha qilish portali.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['🎬 843 Kino', '📺 75 Serial', '🌐 O\'zbek tilida'].map((badge, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}>{badge}</span>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div style={{ display: 'flex', gap: '52px', flexWrap: 'wrap' }}>
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 style={{
                  color: '#fff',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '14px',
                  letterSpacing: '-0.01em',
                }}>{title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {links.map((l, i) => (
                    <li key={i}>
                      <Link
                        href={l.href}
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-dim)',
                          transition: 'color 0.18s',
                          display: 'inline-block',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-copy">
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
            © {new Date().getFullYear()} FilmX Series. Barcha huquqlar himoyalangan.
            Ushbu sayt faqat ta&apos;lim va ko&apos;rgazmali maqsadlarda yaratilgan.
          </p>
        </div>
      </div>
    </footer>
  );
}
