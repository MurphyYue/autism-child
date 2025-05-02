// components/PWAInstallModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

let deferredPrompt: any = null;

export default function PWAInstallModal() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisable, setIsVisible] = useState(true);
  const t = useTranslations('Installation');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const inStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone;

    setIsIOS(isIOSDevice);
    setIsStandalone(inStandaloneMode);

    // Don't show if user dismissed in this session
    if (sessionStorage.getItem('pwa-dismissed') === 'true') setIsVisible(false);
    // Check for the beforeinstallprompt event
    const promptHandler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', promptHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('PWA setup accepted');
    } else {
      console.log('PWA setup dismissed');
    }
    deferredPrompt = null;
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa-dismissed', 'true');
  };

  if (isStandalone) return null; // Already installed
  if (!isIOS && !showPrompt) return null; // No install option needed
  if (!isVisable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white shadow-lg border rounded-xl p-4 z-50 max-w-md mx-auto">
      <button
        onClick={() => handleDismiss()} 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        ✕
      </button>
      {isIOS ? (
        <div className="text-center">
          <p className="text-gray-800 font-medium mb-2">📲 {t("title")}</p>
          <p className="text-sm text-gray-600">
            {t("description")}
            <strong>{t("share")}</strong>{t("share_next")} <strong>{t("add_to_home_screen")}</strong>。
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-800 font-medium mb-2">📲 {t("title")}?</p>
          <button
            onClick={handleInstallClick}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded shadow"
          >
            {t("install")}
          </button>
        </div>
      )}
    </div>
  );
}