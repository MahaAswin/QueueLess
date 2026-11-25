import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

/**
 * CapacitorBridge manages native Android/iOS runtime lifecycle integrations:
 * 1. Hardware Back Button handling (routes backward, double-tap to exit on root screens).
 * 2. Status Bar theming (matches QueueLess champagne/emerald aesthetic).
 * 3. Splash Screen smooth dismissal after React renders.
 * 4. Keyboard appearance & layout adjustment.
 */
export const CapacitorBridge: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPressRef = useRef<number>(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // 1. Initialize Android Status Bar
    const initStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#FBF6EC' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        // Fallback gracefully on web or unsupporting runtimes
      }
    };

    // 2. Hide Native Splash Screen once app finishes loading
    const hideSplash = async () => {
      try {
        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch (e) {
        // Fallback gracefully
      }
    };

    // 3. Configure Virtual Keyboard
    const initKeyboard = async () => {
      try {
        await Keyboard.setAccessoryBarVisible({ isVisible: true });
      } catch (e) {
        // Fallback gracefully
      }
    };

    initStatusBar();
    hideSplash();
    initKeyboard();
  }, []);

  // 4. Hardware Back Button handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const backButtonSub = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const pathname = location.pathname;
      const isRootScreen =
        pathname === '/' ||
        pathname === '/customer' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/shop-owner/dashboard' ||
        pathname === '/admin/dashboard';

      if (!isRootScreen && canGoBack) {
        navigate(-1);
      } else {
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          CapacitorApp.exitApp();
        } else {
          lastBackPressRef.current = now;
        }
      }
    });

    return () => {
      backButtonSub.then((sub) => sub.remove()).catch(() => {});
    };
  }, [location.pathname, navigate]);

  return null;
};
