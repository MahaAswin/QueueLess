import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { NearbyShop } from '../../types/shop.types';
import { CATEGORY_META } from './ShopCard';

interface NearbyShopsMapProps {
  userLocation: { latitude: number; longitude: number };
  shops: NearbyShop[];
  radiusMeters: number;
  selectedShopId?: string | null;
  onSelectShop?: (shop: NearbyShop) => void;
  height?: number | string;
}

export const NearbyShopsMap: React.FC<NearbyShopsMapProps> = ({
  userLocation,
  shops,
  radiusMeters,
  selectedShopId,
  onSelectShop,
  height = 480,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const shopMarkersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User Marker & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. User Marker with pulsating animation
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userIconHtml = `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          top: -4px;
          left: -4px;
          border-radius: 50%;
          background: rgba(18, 124, 78, 0.25);
          animation: ql-radar-pulse 2s infinite ease-out;
        "></div>
        <div style="
          position: absolute;
          width: 18px;
          height: 18px;
          top: 3px;
          left: 3px;
          border-radius: 50%;
          background: #127C4E;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>
    `;

    const userDivIcon = L.divIcon({
      html: userIconHtml,
      className: 'ql-user-map-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
      icon: userDivIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindTooltip('<strong>Your Location</strong>', {
      permanent: false,
      direction: 'top',
      offset: [0, -12],
    });

    userMarkerRef.current = userMarker;

    // 2. Search Radius Circle
    if (circleLayerRef.current) {
      circleLayerRef.current.remove();
    }

    const circle = L.circle([userLocation.latitude, userLocation.longitude], {
      radius: radiusMeters,
      color: '#127C4E',
      weight: 1.5,
      opacity: 0.8,
      fillColor: '#127C4E',
      fillOpacity: 0.08,
      dashArray: '4, 4',
    }).addTo(map);

    circleLayerRef.current = circle;

    // 3. Fit bounds to circle
    const bounds = circle.getBounds();
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
  }, [userLocation.latitude, userLocation.longitude, radiusMeters]);

  // Update Shop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    shopMarkersMapRef.current.clear();

    shops.forEach((shop) => {
      if (!shop.latitude || !shop.longitude) return;

      const isSelected = shop.id === selectedShopId;
      const categoryMeta = CATEGORY_META[shop.category] || CATEGORY_META.OTHER;
      const shopName = shop.shopName || shop.name || 'Partner Outlet';
      const distance = shop.distanceFormatted || (shop.distanceMeters ? `${Math.round(shop.distanceMeters)} m` : '');

      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 5px;
          background: ${isSelected ? '#0D5C3A' : '#FFFFFF'};
          color: ${isSelected ? '#FFFFFF' : '#1A2E26'};
          padding: 4px 10px;
          border-radius: 20px;
          border: 2px solid ${isSelected ? '#FFFFFF' : '#127C4E'};
          box-shadow: 0 3px 8px rgba(0,0,0,0.22);
          cursor: pointer;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          transition: all 0.2s ease;
        ">
          <span style="display: inline-flex; align-items: center;">📍</span>
          <span>${shopName}</span>
          ${distance ? `<span style="font-size: 10px; opacity: 0.85; margin-left: 2px;">• ${distance}</span>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'ql-shop-map-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([shop.latitude, shop.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : 100,
      });

      // Interactive Popup Content
      const popupHtml = `
        <div style="font-family: inherit; min-width: 220px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <span style="
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #127C4E;
              background: #E8F5EE;
              padding: 2px 8px;
              border-radius: 12px;
            ">
              ${categoryMeta.label}
            </span>
            ${
              shop.isOpen !== false
                ? '<span style="font-size: 11px; font-weight: 700; color: #127C4E;">● Open</span>'
                : '<span style="font-size: 11px; font-weight: 700; color: #DC2626;">● Closed</span>'
            }
          </div>

          <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 800; color: #1A2E26;">
            ${shopName}
          </h4>

          <div style="font-size: 12px; color: #64748B; margin-bottom: 8px;">
            ${distance ? `<strong>${distance} away</strong> • ` : ''}
            <span>Avg wait: ${shop.averageWaitMinutes || 5} min</span>
          </div>

          <div style="font-size: 11.5px; color: #64748B; margin-bottom: 12px; line-height: 1.3;">
            ${shop.address}, ${shop.city}
          </div>

          <a href="/customer/shops/${shop.id}" style="text-decoration: none; display: block;">
            <button style="
              width: 100%;
              background: #127C4E;
              color: #FFFFFF;
              border: none;
              border-radius: 8px;
              padding: 8px 12px;
              font-size: 12.5px;
              font-weight: 700;
              cursor: pointer;
              transition: background 0.15s ease;
            ">
              View Shop & Order →
            </button>
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        offset: [0, -14],
        closeButton: true,
      });

      marker.on('click', () => {
        if (onSelectShop) {
          onSelectShop(shop);
        }
      });

      markersLayer.addLayer(marker);
      shopMarkersMapRef.current.set(shop.id, marker);
    });
  }, [shops, selectedShopId, onSelectShop]);

  // Center on Selected Shop
  useEffect(() => {
    if (!selectedShopId) return;
    const marker = shopMarkersMapRef.current.get(selectedShopId);
    const map = mapInstanceRef.current;
    if (marker && map) {
      const latLng = marker.getLatLng();
      map.panTo(latLng, { animate: true, duration: 0.5 });
      marker.openPopup();
    }
  }, [selectedShopId]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        backgroundColor: 'var(--color-surface-subtle)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Embedded CSS for Radar Pulse Animation */}
      <style>{`
        @keyframes ql-radar-pulse {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
          padding: 6px !important;
        }
        .leaflet-popup-tip {
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
};
