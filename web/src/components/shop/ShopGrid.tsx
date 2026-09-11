import React from 'react';
import type { Shop } from '../../types/shop.types';
import { ShopCard } from './ShopCard';

interface ShopGridProps {
  shops: Shop[];
}

export const ShopGrid: React.FC<ShopGridProps> = ({ shops }) => {
  return (
    <div
      id="shops-grid-container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 24,
      }}
    >
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
};
