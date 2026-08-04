import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { WifiOff } from 'lucide-react';

// App-wide connectivity notifier. Shows a persistent pill while the browser
// reports it's offline, and a brief toast when the connection comes back.
// Purely client-side (navigator.onLine + online/offline events) - no backend
// involved, so it works even when the API itself is unreachable.
const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const wasOffline = useRef(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline.current) {
        toast.success("You're back online");
      }
      wasOffline.current = false;
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOffline.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg">
        <WifiOff size={15} className="flex-shrink-0" />
        You're offline - some features may not work
      </div>
    </div>
  );
};

export default NetworkStatus;