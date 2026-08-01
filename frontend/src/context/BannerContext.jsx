import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBanner } from '../services/bannerApi';

const BannerContext = createContext(null);

const dismissKeyFor = (banner) => `banner_dismissed_${banner?.updatedAt || 'none'}`;

export const BannerProvider = ({ children }) => {
  const [banner, setBanner] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Single lightweight request, fired once, non-blocking - never delays the rest of the app.
    getBanner()
      .then((data) => {
        setBanner(data);
        setDismissed(localStorage.getItem(dismissKeyFor(data)) === '1');
      })
      .catch(() => {
        // Fail silently - a broken/unreachable banner endpoint should never break the site.
        setBanner(null);
      });
  }, []);

  const dismissBanner = () => {
    if (banner) localStorage.setItem(dismissKeyFor(banner), '1');
    setDismissed(true);
  };

  const refreshBanner = async () => {
    const data = await getBanner();
    setBanner(data);
    setDismissed(localStorage.getItem(dismissKeyFor(data)) === '1');
    return data;
  };

  const visible = Boolean(banner?.enabled && banner?.text && !dismissed);

  return (
    <BannerContext.Provider value={{ banner, visible, dismissBanner, refreshBanner }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanner = () => useContext(BannerContext);
