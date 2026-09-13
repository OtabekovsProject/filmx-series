'use client';

import React, { useState } from 'react';

const APK_DOWNLOAD_URL = 'https://github.com/OtabekovsProject/filmx-apk/releases/latest/download/FilmX-v1.0.apk';
const RELEASES_PAGE_URL = 'https://github.com/OtabekovsProject/filmx-apk/releases';

export default function AndroidAppShowcase() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 4000);
  };

  return (
    <section
      id="android-app"
      className="android-app-showcase-section"
      style={{
        position: 'relative',
        margin: '40px 0 50px',
        padding: '48px 32px',
        borderRadius: '28px',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(61, 220, 132, 0.18), rgba(7, 10, 18, 0.96))',
        border: '1px solid rgba(61, 220, 132, 0.28)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(61, 220, 132, 0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '10%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61, 220, 132, 0.22) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1080px', margin: '0 auto' }}>
        {/* Top Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(61, 220, 132, 0.12)',
              border: '1px solid rgba(61, 220, 132, 0.35)',
              backdropFilter: 'blur(12px)',
              padding: '7px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#3ddc84',
              boxShadow: '0 4px 18px rgba(61, 220, 132, 0.2)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4126 13.8533 8.125 12 8.125c-1.8533 0-3.5902.2876-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
            </svg>
            <span>RASMIY MOBIL ILOVA · v1.6.0 YANGI NASHR</span>
          </div>

          {/* Section Main Title */}
          <h2
            style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#ffffff',
              marginTop: '12px',
              marginBottom: '14px',
            }}
          >
            Bizning Android Ilovamiz — FilmX Mobile APK
          </h2>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 17px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '780px',
              margin: '0 auto',
            }}
          >
            Endi sevimli kinolaringiz, seriallaringiz va multfilmlaringiz har doim cho&apos;ntagingizda!
            Saytga qo&apos;shilgan barcha yangi asarlar ilovada <strong style={{ color: '#3ddc84' }}>avtomatik yangilanadi</strong>,
            qayta o&apos;rnatish shart emas va <strong style={{ color: '#fff' }}>60fps tezlikda</strong> qotmasdan ishlaydi.
          </p>
        </div>

        {/* 4 Super Feature Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            marginBottom: '36px',
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(61, 220, 132, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '14px',
                color: '#3ddc84',
              }}
            >
              🔄
            </div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              Jonli Avto-Yangilanish (OTA)
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              Saytga yangi kino yoki serial qo&apos;shilganda, ilova orqa fonda o&apos;zi yangilab oladi. Qayta o&apos;rnatish talab qilinmaydi!
            </p>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(0, 242, 254, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '14px',
                color: '#00f2fe',
              }}
            >
              ⚡
            </div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              60FPS Yuqori Tezlik (0 Lag)
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              Katalogdagi 1,480+ kinolar va 5,000+ qismlar bir zumda ochiladi, hech qanday qotishlarsiz va kam batareya sarfi bilan ishlaydi.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(229, 9, 20, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '14px',
                color: '#e50914',
              }}
            >
              📥
            </div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              Oflayn Yuklab Olish
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              Kinolarni to&apos;g&apos;ridan-to&apos;g&apos;ri telefon xotirasiga yoki shaxsiy server ro&apos;yxatingizga yuklab, internetsiz tomosha qiling.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '14px',
                color: '#f59e0b',
              }}
            >
              🚫
            </div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
              100% Reklamasiz & Toza
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              Bezovta qiluvchi reklamalarsiz, qulay to&apos;liq ekran rejimi, tezlikni sozlash va avtomatik qismlarni o&apos;tkazish imkoniyati.
            </p>
          </div>
        </div>

        {/* Download Action Area */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(61, 220, 132, 0.3)',
            borderRadius: '22px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            backdropFilter: 'blur(14px)',
            gap: '18px',
          }}
        >
          {/* Version and Spec Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                background: 'rgba(61, 220, 132, 0.15)',
                color: '#3ddc84',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid rgba(61, 220, 132, 0.3)',
              }}
            >
              Android 7.0+
            </span>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Hajmi: ~45 MB
            </span>
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Versiya: v1.6.0
            </span>
            <span
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Tas-ix Cheksiz
            </span>
          </div>

          {/* Download Buttons Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              width: '100%',
              maxWidth: '650px',
            }}
          >
            <a
              href={APK_DOWNLOAD_URL}
              onClick={handleDownload}
              className="btn-primary"
              style={{
                flex: '1 1 260px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 28px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.45)',
                transition: 'all 0.25s ease',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
              </svg>
              <span>{downloading ? "Yuklanmoqda..." : "FilmX APK ni Yuklab Olish"}</span>
            </a>

            <a
              href={RELEASES_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px 24px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Releases</span>
            </a>
          </div>

          {/* Quick Install 3-Step Guide */}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              color: '#94a3b8',
              fontSize: '12px',
            }}
          >
            <span>① <strong>Faylni yuklab oling</strong></span>
            <span>② <strong>"O&apos;rnatish"ni bosing</strong></span>
            <span>③ <strong>Reklamasiz tomosha qiling</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}
