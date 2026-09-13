'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import ScrollToTop from '@/components/ScrollToTop';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh' }}>{children}</main>
      <Footer />
      {/* Floating Scroll to Top button */}
      <ScrollToTop />
      {/* Native-style floating bottom dock on mobile/tablet devices */}
      <MobileBottomNav />
    </>
  );
}
