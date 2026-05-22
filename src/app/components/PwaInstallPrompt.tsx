import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    if (isIos() && !isInstalled) {
      // Check if user dismissed previously
      const hasDismissed = localStorage.getItem('pwa-ios-dismissed');
      if (!hasDismissed) {
        setShowIosPrompt(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
      setShowIosPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    await deferredPrompt.userChoice;
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const dismissIosPrompt = () => {
    setShowIosPrompt(false);
    localStorage.setItem('pwa-ios-dismissed', 'true');
  };

  const dismissStandardPrompt = () => {
    setDismissed(true);
  };

  if (isInstalled) {
    return null;
  }

  if (showIosPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in fade-in slide-in-from-bottom-5 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm sm:p-0">
        <div className="bg-white border shadow-xl rounded-xl p-4 relative">
          <button 
            onClick={dismissIosPrompt}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-2 flex items-center gap-2 text-sky-600">
            <Download className="w-5 h-5" />
            <h3 className="font-semibold text-gray-900">Install App</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Install this application on your home screen for quick and easy access when you're on the go.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">1.</span> Tap the <Share className="w-4 h-4 inline mx-1" /> Share button
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">2.</span> Tap <PlusSquare className="w-4 h-4 inline mx-1" /> 'Add to Home Screen'
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isInstallable && !dismissed) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in fade-in slide-in-from-bottom-5 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm sm:p-0">
        <div className="bg-white border shadow-xl rounded-xl p-4 flex items-center space-x-4 relative">
          <button 
            onClick={dismissStandardPrompt}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 border shadow-sm text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Install SQMS App</h3>
            <p className="text-xs text-gray-500 mt-1">Add to your home screen for a seamless mobile experience.</p>
          </div>
          <Button onClick={handleInstallClick} size="sm" className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 shrink-0">
            <Download className="w-4 h-4" />
            Install
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
