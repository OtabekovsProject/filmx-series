import { getAllMedia } from '@/lib/data';
import CatalogView from '@/components/CatalogView';
import { Suspense } from 'react';

export default function CatalogPage() {
  const allItems = getAllMedia();

  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Katalog yuklanmoqda...</p>
      </div>
    }>
      <CatalogView initialItems={allItems} />
    </Suspense>
  );
}
