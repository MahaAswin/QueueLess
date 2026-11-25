import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export type GeolocationStatus =
  | 'idle'
  | 'prompting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = 'queueless_user_location';

export const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          return parsed;
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
    return null;
  });

  const [status, setStatus] = useState<GeolocationStatus>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return 'granted';
      }
    } catch {
      // Ignore
    }
    return 'idle';
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setStatus('prompting');
    setErrorMessage(null);

    // 1. Native Capacitor implementation (Android / iOS)
    if (Capacitor.isNativePlatform()) {
      try {
        let perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') {
          perm = await Geolocation.requestPermissions();
          if (perm.location !== 'granted') {
            setStatus('denied');
            setErrorMessage('Location permission was denied. Allow location access in device settings to discover nearby shops.');
            return;
          }
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });

        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        setStatus('granted');
        setErrorMessage(null);
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
        } catch {
          // Ignore storage errors
        }
        return;
      } catch (err: any) {
        setStatus('unavailable');
        setErrorMessage('Failed to obtain device location. Please ensure location services / GPS are turned on.');
        setCoordinates(null);
        return;
      }
    }

    // 2. Web browser fallback implementation
    if (!navigator.geolocation) {
      setStatus('unsupported');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        setStatus('granted');
        setErrorMessage(null);
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
        } catch {
          // Ignore storage errors
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setStatus('denied');
            setErrorMessage('Location access is disabled. Allow location access to find shops near you.');
            break;
          case err.POSITION_UNAVAILABLE:
            setStatus('unavailable');
            setErrorMessage('Your location is currently unavailable. Please try again.');
            break;
          case err.TIMEOUT:
            setStatus('timeout');
            setErrorMessage('Location request timed out. Please try again.');
            break;
          default:
            setStatus('unavailable');
            setErrorMessage('Failed to obtain location. Please try again.');
        }
        setCoordinates(null);
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setStatus('idle');
    setErrorMessage(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    coordinates,
    status,
    loading: status === 'prompting',
    error: errorMessage,
    requestLocation,
    clearLocation,
  };
};
