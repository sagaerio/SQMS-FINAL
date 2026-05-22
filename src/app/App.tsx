import { RouterProvider } from 'react-router';
import { router } from './routes';
import { NotificationSystem } from './components/NotificationSystem';
import { IndustryProvider } from './contexts/IndustryContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Service Worker Registration for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // vite-plugin-pwa generates sw.js in the root of the build
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Dynamically inject the PWA manifest and theme color
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (!existingManifest) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }

    const existingThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!existingThemeColor) {
      const themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      themeColorMeta.content = '#0ea5e9';
      document.head.appendChild(themeColorMeta);
    }
    
    // Apple touch icon for iOS support
    const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!existingAppleIcon) {
      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = '/icon-192.svg';
      document.head.appendChild(appleIcon);
    }
  }, []);

  return (
    <AuthProvider>
      <IndustryProvider>
        <NotificationProvider>
          <NotificationSystem />
          <RouterProvider router={router} />
          <PwaInstallPrompt />
        </NotificationProvider>
      </IndustryProvider>
    </AuthProvider>
  );
}
