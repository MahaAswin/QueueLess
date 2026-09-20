import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '../ui/Button';

interface ShopLocationPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  height?: number | string;
}

export const ShopLocationPicker: React.FC<ShopLocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
  height = 320,
}) => {
  const defaultLat = latitude && !isNaN(latitude) ? latitude : 13.0827;
  const defaultLng = longitude && !isNaN(longitude) ? longitude : 80.2707;

  const [currentLat, setCurrentLat] = useState<number>(defaultLat);
  const [currentLng, setCurrentLng] = useState<number>(defaultLng);
  const [latInput, setLatInput] = useState<string>(String(defaultLat));
  const [lngInput, setLngInput] = useState<string>(String(defaultLng));
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync state if props change from outside
  useEffect(() => {
    if (latitude !== undefined && !isNaN(latitude) && latitude !== currentLat) {
      setCurrentLat(latitude);
      setLatInput(String(latitude));
    }
    if (longitude !== undefined && !isNaN(longitude) && longitude !== currentLng) {
      setCurrentLng(longitude);
      setLngInput(String(longitude));
    }
  }, [latitude, longitude]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon
      const pinIconHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: #127C4E;
          color: #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2.5px solid #FFFFFF;
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">🏪</span>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinIconHtml,
        className: 'ql-shop-pin-picker-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      });

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);

      marker.bindTooltip('<strong>Drag to adjust shop location</strong>', {
        permanent: false,
        direction: 'top',
        offset: [0, -38],
      });

      // Drag event
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const roundedLat = parseFloat(pos.lat.toFixed(6));
        const roundedLng = parseFloat(pos.lng.toFixed(6));
        setCurrentLat(roundedLat);
        setCurrentLng(roundedLng);
        setLatInput(String(roundedLat));
        setLngInput(String(roundedLng));
        onChange(roundedLat, roundedLng);
        setLocationStatus({
          type: 'info',
          message: 'Location pinned from map drag.',
        });
      });

      // Click on map to move marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        const roundedLat = parseFloat(e.latlng.lat.toFixed(6));
        const roundedLng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([roundedLat, roundedLng]);
        setCurrentLat(roundedLat);
        setCurrentLng(roundedLng);
        setLatInput(String(roundedLat));
        setLngInput(String(roundedLng));
        onChange(roundedLat, roundedLng);
        setLocationStatus({
          type: 'info',
          message: 'Location pinned from map click.',
        });
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when currentLat/Lng change
  const updateMapPosition = (lat: number, lng: number, shouldPan = true) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapInstanceRef.current && shouldPan) {
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setIsLocating(true);
    setLocationStatus({
      type: 'info',
      message: 'Acquiring GPS coordinates from your device...',
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setCurrentLat(lat);
        setCurrentLng(lng);
        setLatInput(String(lat));
        setLngInput(String(lng));
        updateMapPosition(lat, lng, true);
        onChange(lat, lng);
        setIsLocating(false);
        setLocationStatus({
          type: 'success',
          message: 'Shop location updated from your current GPS location.',
        });
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'Failed to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please allow access or set pin manually on map.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location position unavailable. Please set manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please try again.';
        }
        setLocationStatus({
          type: 'error',
          message: errorMsg,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleManualCoordBlur = () => {
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(lngInput);

    if (
      !isNaN(parsedLat) &&
      !isNaN(parsedLng) &&
      parsedLat >= -90 &&
      parsedLat <= 90 &&
      parsedLng >= -180 &&
      parsedLng <= 180
    ) {
      setCurrentLat(parsedLat);
      setCurrentLng(parsedLng);
      updateMapPosition(parsedLat, parsedLng, true);
      onChange(parsedLat, parsedLng);
      setLocationStatus({
        type: 'info',
        message: 'Coordinates updated manually.',
      });
    } else {
      setLocationStatus({
        type: 'error',
        message: 'Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180).',
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
            Pin Shop Location on Map
          </span>
          <p style={{ margin: '2px 0 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Drag the pin or click anywhere on the map to set the exact shop pickup coordinates for customers.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          isLoading={isLocating}
          style={{ gap: '6px', whiteSpace: 'nowrap' }}
        >
          <span>🎯</span>
          <span>Use Current Location</span>
        </Button>
      </div>

      {locationStatus && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            backgroundColor:
              locationStatus.type === 'success'
                ? 'var(--color-success-bg, #E8F5EE)'
                : locationStatus.type === 'error'
                ? '#FEE2E2'
                : 'var(--color-surface-subtle)',
            color:
              locationStatus.type === 'success'
                ? 'var(--color-primary-dark)'
                : locationStatus.type === 'error'
                ? '#DC2626'
                : 'var(--color-text)',
            border: `1px solid ${
              locationStatus.type === 'success'
                ? 'var(--color-primary-light)'
                : locationStatus.type === 'error'
                ? '#FCA5A5'
                : 'var(--color-border)'
            }`,
          }}
        >
          {locationStatus.message}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          height,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            onBlur={handleManualCoordBlur}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 'var(--font-size-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            onBlur={handleManualCoordBlur}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 'var(--font-size-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
