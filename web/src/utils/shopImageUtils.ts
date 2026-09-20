import type { Shop, ShopCategory } from '../types/shop.types';

/**
 * Category-based rich SVG illustrations as default images.
 * Designed to feel sleek, vibrant, and modern matching QueueLess aesthetics.
 */
const CATEGORY_DEFAULT_IMAGES: Record<ShopCategory, string> = {
  RESTAURANT: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="g-rest" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23FFFBEB"/>
        <stop offset="100%" stop-color="%23FDE68A"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(%23g-rest)"/>
    <circle cx="400" cy="230" r="140" fill="%23FEF3C7" stroke="%23D97706" stroke-width="6"/>
    <circle cx="400" cy="230" r="110" fill="%23FFFFFF" stroke="%23F59E0B" stroke-width="2" stroke-dasharray="8 6"/>
    <!-- Fork -->
    <path d="M 330 150 L 330 200 C 330 220 360 220 360 200 L 360 150 M 345 150 L 345 200 M 345 220 L 345 310" stroke="%23B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <!-- Knife -->
    <path d="M 460 150 C 460 200 440 230 440 230 L 440 310" stroke="%23B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <!-- Cloche/Banner -->
    <text x="400" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="%2392400E" text-anchor="middle" letter-spacing="1">RESTAURANT &amp; DINING</text>
  </svg>`,

  GROCERY: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="g-groc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23ECFDF5"/>
        <stop offset="100%" stop-color="%23A7F3D0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(%23g-groc)"/>
    <circle cx="400" cy="225" r="140" fill="%23D1FAE5" stroke="%23059669" stroke-width="6"/>
    <!-- Shopping Basket -->
    <path d="M 310 200 L 490 200 L 460 300 L 340 300 Z" fill="%2310B981" stroke="%23047857" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 340 200 L 400 130 L 460 200" fill="none" stroke="%23047857" stroke-width="8" stroke-linecap="round"/>
    <line x1="360" y1="230" x2="370" y2="280" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round"/>
    <line x1="400" y1="230" x2="400" y2="280" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round"/>
    <line x1="440" y1="230" x2="430" y2="280" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round"/>
    <text x="400" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="%23065F46" text-anchor="middle" letter-spacing="1">GROCERY &amp; SUPERMARKET</text>
  </svg>`,

  BAKERY: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="g-bake" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23FFF7ED"/>
        <stop offset="100%" stop-color="%23FED7AA"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(%23g-bake)"/>
    <circle cx="400" cy="225" r="140" fill="%23FFEDD5" stroke="%23EA580C" stroke-width="6"/>
    <!-- Cupcake / Pastry -->
    <path d="M 330 220 L 470 220 L 445 310 L 355 310 Z" fill="%23FB923C" stroke="%23C2410C" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 320 220 C 320 160 360 140 400 140 C 440 140 480 160 480 220 Z" fill="%23FFFFFF" stroke="%23C2410C" stroke-width="6"/>
    <circle cx="400" cy="130" r="14" fill="%23EF4444"/>
    <text x="400" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="%239A3412" text-anchor="middle" letter-spacing="1">BAKERY &amp; CAFE</text>
  </svg>`,

  PHARMACY: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="g-pharm" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23F0F9FF"/>
        <stop offset="100%" stop-color="%23BAE6FD"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(%23g-pharm)"/>
    <circle cx="400" cy="225" r="140" fill="%23E0F2FE" stroke="%230284C7" stroke-width="6"/>
    <!-- Medical Cross -->
    <rect x="375" y="145" width="50" height="160" rx="10" fill="%230284C7"/>
    <rect x="320" y="200" width="160" height="50" rx="10" fill="%230284C7"/>
    <text x="400" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="%23075985" text-anchor="middle" letter-spacing="1">PHARMACY &amp; HEALTHCARE</text>
  </svg>`,

  STATIONERY: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="g-stat" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23F5F3FF"/>
        <stop offset="100%" stop-color="%23DDD6FE"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(%23g-stat)"/>
    <circle cx="400" cy="225" r="140" fill="%23EDE9FE" stroke="%237C3AED" stroke-width="6"/>
    <!-- Book & Pen -->
    <path d="M 320 180 L 400 200 L 480 180 L 480 290 L 400 310 L 320 290 Z" fill="%238B5CF6" stroke="%236D28D9" stroke-width="6" stroke-linejoin="round"/>
    <line x1="400" y1="200" x2="400" y2="310" stroke="%23FFFFFF" stroke-width="4"/>
    <text x="400" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="%235B21B6" text-anchor="middle" letter-spacing="1">STATIONERY &amp; BOOKS</text>
  </svg>`,

  MEAT_SHOP: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="g-meat" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23FFF1F2"/>
        <stop offset="100%" stop-color="%23FECDD3"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(%23g-meat)"/>
    <circle cx="400" cy="225" r="140" fill="%23FFE4E6" stroke="%23E11D48" stroke-width="6"/>
    <!-- Steak / Cleaver -->
    <path d="M 330 230 C 330 170 410 160 450 200 C 480 230 460 290 400 290 C 350 290 330 270 330 230 Z" fill="%23F43F5E" stroke="%23BE123C" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="380" cy="220" r="14" fill="%23FFFFFF"/>
    <text x="400" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="%239F1239" text-anchor="middle" letter-spacing="1">MEAT &amp; SEAFOOD</text>
  </svg>`,

  OTHER: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="g-oth" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23F8FAFC"/>
        <stop offset="100%" stop-color="%23E2E8F0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(%23g-oth)"/>
    <circle cx="400" cy="225" r="140" fill="%23F1F5F9" stroke="%23475569" stroke-width="6"/>
    <!-- Storefront Canopy -->
    <path d="M 310 200 L 490 200 L 480 290 L 320 290 Z" fill="%2364748B" stroke="%23334155" stroke-width="6" stroke-linejoin="round"/>
    <path d="M 290 160 L 510 160 L 490 200 L 310 200 Z" fill="%230F172A" stroke="%230F172A" stroke-width="4"/>
    <text x="400" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="%231E293B" text-anchor="middle" letter-spacing="1">RETAIL STORE</text>
  </svg>`,
};

/**
 * Returns the category-specific default image.
 */
export const getCategoryDefaultImage = (category?: ShopCategory | string): string => {
  if (category && category in CATEGORY_DEFAULT_IMAGES) {
    return CATEGORY_DEFAULT_IMAGES[category as ShopCategory];
  }
  return CATEGORY_DEFAULT_IMAGES.OTHER;
};

/**
 * Primary shop image resolver:
 * 1. Returns custom image URL if available.
 * 2. Falls back to category default image otherwise.
 */
export const getShopImage = (shop?: Partial<Shop> | null): string => {
  if (!shop) {
    return CATEGORY_DEFAULT_IMAGES.OTHER;
  }
  if (shop.imageUrl && typeof shop.imageUrl === 'string' && shop.imageUrl.trim().length > 0) {
    return shop.imageUrl.trim();
  }
  return getCategoryDefaultImage(shop.category);
};

/**
 * Opens navigation directions to shop coordinates in external map app.
 */
export const openShopNavigation = (latitude?: number | null, longitude?: number | null) => {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    return;
  }
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
