# FilmX — Zamonaviy Kino va Seriallar Platformasi

FilmX — Next.js 15, React 19 va TypeScript asosida yaratilgan zamonaviy, tezkor va PWA (Progressive Web App) qo'llab-quvvatlovchi kino va seriallar striming web-platformasi.

## 🚀 Asosiy Imkoniyatlar

- **🎬 1,479+ Kino va Seriallar Katalogi (1,171 Kino, 308 Serial, 5,000+ Qism)**: Barcha media fayllar to'liq optimallashgan statik sahifalar (SSG - 1,494 sahifa) sifatida ishlaydi.
- **⚡ Ultra-Tezkor va Yengil**: Yagona reaktiv `StoreContext`, render-blocking `@import` bartaraf etilgan, First Load JS ~103 KB.
- **✨ Yangilangan Dinamik Hero Slider**:
  - Alohida-alohida joylashgan neon jiloli vertikal kino kartalari.
  - Slaydlar almashinuvi, klaviatura (← / →) navigatsiyasi va tezkor Sevimlilarga saqlash tugmasi.
  - Jonli progress indikatori (Live update timer).
  - Sichqoncha olib borilganda (hover) avtomatik to'xtash va istalgan kartani tanlash imkoniyati.
- **📱 PWA (Progressive Web App)**: Oflayn rejimda ishlash, Service Worker (v3.2 - video range request bypass bilan) va o'rnatish imkoniyati.
- **❤️ Sevimlilar Tizimi (Favorites)**: $O(1)$ tezkor tekshiruv, bir zumda sinxronlashuvchi LocalStorage integratsiyasi.
- **⏯️ Ko'rishda Davom Eting (Resume Playback)**: Har bir film va serial qismida to'xtagan vaqtni saqlab qolish va video player ochilganda bir bosishda oxirgi to'xtagan joydan davom ettirish taklifi.
- **🎥 Zamonaviy Video Player**: Ambient Cinema Glow (poster aks ettiruvchi nur), teatr rejimi (Theater mode), sifat sozlamalari, ovoz/tezlik xotirasi va klaviatura yordamchi modali (`?`).
- **🔍 Qidiruv va Filtrlash**: 1,479 ta asar uchun oldindan indeksatsiyalangan tezkor qidiruv, tavsiya teglari, janrlar va davlatlar bo'yicha saralash.
- **📱 Responsive Dizayn**: Desktop, planshet va mobil qurilmalar uchun moslashuvchan interfeys (Mobile Bottom Nav va Scroll-To-Top suzuvchi tugmasi bilan).

## 🛠️ Texnologiyalar

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS (zamonaviy HSL o'zgaruvchilar, shisha effekti / Glassmorphism, Neon glow)
- **Scraper / Data**: Cheerio, Node.js

## 📦 Loyihani Ishga Tushirish

1. Bog'liqliklarni o'rnatish:
```bash
npm install
```

2. Dasturni dev rejimida ishga tushirish:
```bash
npm run dev
```

3. Production uchun build qilish:
```bash
npm run build
```

4. Ishga tushirish:
```bash
npm run start
```
