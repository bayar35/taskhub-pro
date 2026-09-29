import { useState, useEffect } from 'react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500 text-white text-center py-2 text-sm">
      ⚠️ Та офлайн байна. Өөрчлөлтүүд холбогдсоны дараа синк хийнэ.
    </div>
  );
}