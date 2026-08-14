import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { WifiOff } from 'lucide-react';

// App-wide connectivity notifier. Shows a full-screen "you're offline" card
// while the browser reports it's offline, and a brief toast when the
// connection comes back. Purely client-side (navigator.onLine +
// online/offline events) - no backend involved, so it works even when the
// API itself is unreachable.
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-sm px-4 dark:bg-gray-950/95">
      <div className="card w-full max-w-sm text-center">
        <span
          className="text-2xl font-black uppercase tracking-tight italic text-primary-900 dark:text-white inline-block mb-5"
          style={{ transform: 'skewX(-6deg)' }}
        >
          HORIZON<span className="text-accent-500 not-italic">+</span>
        </span>

        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <WifiOff size={22} className="text-gray-500 dark:text-gray-400" />
        </div>

        <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1.5">You're offline</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
          Check your internet connection. This page will reconnect automatically as you're back online.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" />
          Waiting for connection...
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;