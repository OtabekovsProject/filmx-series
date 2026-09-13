'use client';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Tas-ix Cheksiz Tezlik',
    desc: 'O\'zbekiston hududidagi barcha internet provayderlar orqali megabayt sarflamasdan, bufferlarsiz va yuqori tezlikda tomosha qiling.',
    badge: 'Tezkor Oqim',
    color: '#10b981'
  },
  {
    icon: '🚫',
    title: '100% Reklamasiz',
    desc: 'Hech qanday bezovta qiluvchi bannerlar, majburiy videoroliklar va xalaqit beruvchi popuplarsiz toza va xotirjam kino zavqi.',
    badge: 'Toza Oqim',
    color: '#ef4444'
  },
  {
    icon: '🔄',
    title: 'Avtomatik Yangilanish',
    desc: 'Har bir necha soatda yangi chiqqan jahon filmlari, multfilmlar va yangi serial fasllari saytga avtomatik tarzda qo\'shib boriladi.',
    badge: '24/7 Yangilanadi',
    color: '#f59e0b'
  },
  {
    icon: '🎧',
    title: 'Professional Dublyaj',
    desc: 'O\'zbekistonning eng mohir ovoz ustalari va dublyaj studiyalari tomonidan o\'zbek tiliga o\'girilgan sara filmlar va seriallar.',
    badge: 'O\'zbek Tilida',
    color: '#8b5cf6'
  },
  {
    icon: '📱',
    title: 'Barcha Qurilmalarda (PWA)',
    desc: 'Smartfon, planshet, kompyuter va Smart TV ekranlariga to\'liq moslashgan, ilova shaklida o\'rnatish imkoniyatiga ega.',
    badge: 'Ilova Rejimi',
    color: '#3b82f6'
  },
  {
    icon: '💾',
    title: 'Aqlli Ko\'rish Tarixi',
    desc: 'Ko\'rishni to\'xtatgan daqiqangizni eslab qoladi va keyingi safar bitta tugma orqali to\'xtagan joyingizdan davom ettiradi.',
    badge: 'Smart Resume',
    color: '#ec4899'
  }
];

export default function PlatformFeatures() {
  return (
    <section className="platform-features-section" style={{
      margin: '60px 0 30px',
      padding: '48px 32px',
      background: 'rgba(10, 15, 29, 0.5)',
      borderRadius: '24px',
      border: '1px solid var(--border-subtle)',
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(229, 9, 20, 0.1)',
          border: '1px solid rgba(229, 9, 20, 0.3)',
          padding: '4px 14px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          color: '#ff7485',
          marginBottom: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.8px'
        }}>
          Nega aynan FilmX?
        </div>
        <h2 style={{
          fontSize: 'clamp(24px, 3.5vw, 36px)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: '#fff',
          marginBottom: '12px'
        }}>
          Bizning Asosiy Afzalliklarimiz
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          FilmX foydalanuvchilarga eng qulay, tezkor va sifatli kino tomosha qilish tajribasini taqdim etish uchun maxsus ishlab chiqilgan.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {FEATURES.map((feat, index) => (
          <div
            key={index}
            className="feature-card"
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '24px',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: `${feat.color}15`,
                border: `1px solid ${feat.color}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>
                {feat.icon}
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: feat.color,
                background: `${feat.color}15`,
                border: `1px solid ${feat.color}30`,
                padding: '3px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                {feat.badge}
              </span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              {feat.title}
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
              {feat.desc}
            </p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 16px 35px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </section>
  );
}
