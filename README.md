# FilmX — Zamonaviy Kino va Seriallar Platformasi

FilmX — Next.js 15, React 19 va TypeScript asosida yaratilgan zamonaviy, tezkor va PWA (Progressive Web App) qo'llab-quvvatlovchi kino va seriallar striming web-platformasi.

## 🚀 Asosiy Imkoniyatlar

- **🎬 930+ Kino va Seriallar Katalogi**: Barcha media fayllar to'liq optimallashgan statik sahifalar (SSG) sifatida ishlaydi.
- **⚡ Tezkor va Yengil**: Sahifalarning birinchi yuklanish hajmi bor-yo'g'i ~103 KB.
- **✨ Yangilangan Dinamik Hero Slider**:
  - Alohida-alohida joylashgan neon jiloli vertikal kino kartalari.
  - Har 2.5 soniyada uzluksiz navbat bilan yangilanuvchi dinamik kartalar.
  - Jonli progress indikatori (Live update timer).
  - Sichqoncha olib borilganda (hover) avtomatik to'xtash va istalgan kartani tanlash imkoniyati.
- **📱 PWA (Progressive Web App)**: Oflayn rejimda ishlash, Service Worker (v2.0) va o'rnatish imkoniyati.
- **❤️ Sevimlilar Tizimi (Favorites)**: Foydalanuvchi yoqtirgan filmlarini saqlab borish uchun LocalStorage integratsiyasi.
- **⏯️ Ko'rishda Davom Eting (Continue Watching)**: Har bir film va serial qismida to'xtagan vaqtni saqlab qolish va keyinroq davom ettirish.
- **🎥 Zamonaviy Video Player**: Teatr rejimi (Theater mode), sifat sozlamalari, ovoz va boshqaruv klavishlari.
- **🔍 Qidiruv va Filtrlash**: Janrlar, davlatlar, chiqarilgan yil va reyting bo'yicha tezkor qidiruv.
- **📱 Responsive Dizayn**: Desktop, planshet va mobil qurilmalar uchun moslashuvchan interfeys (Mobile Bottom Nav bilan).

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
