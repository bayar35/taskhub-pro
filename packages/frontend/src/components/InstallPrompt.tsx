import { useState, useEffect } from 'react';
import { Button } from './Button';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold dark:text-white">Апп суулгах</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            TaskHub Pro-г утсан дээрээ суулгаж, офлайн ашиглаарай
          </p>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button onClick={handleInstall} size="sm">
          Суулгах
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPrompt(false)}
        >
          Дараа
        </Button>
      </div>
    </div>
  );
}