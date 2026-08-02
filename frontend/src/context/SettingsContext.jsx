import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '../services/settingsApi';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);

  const load = () => getSettings().then(setSettings).catch(() => setSettings(null));

  useEffect(() => {
    load();
  }, []);

  // Apply document title + favicon site-wide once settings are known
  useEffect(() => {
    if (!settings) return;
    if (settings.seoTitle || settings.websiteName) {
      document.title = settings.seoTitle || settings.websiteName;
    }
    if (settings.websiteFavicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.websiteFavicon;
    }
    if (settings.seoDescription) {
      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = settings.seoDescription;
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: load }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);