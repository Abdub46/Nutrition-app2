import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { useBanner } from '../context/BannerContext';

const TopBanner = () => {
  const { banner, visible, dismissBanner } = useBanner();

  if (!visible) return null;

  const content = (
    <>
      <span className="truncate">{banner.text}</span>

      {banner.linkUrl && banner.linkText && (
        <span className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 whitespace-nowrap">
          {banner.linkText}
          {banner.showLinkIcon && <ExternalLink size={13} />}
        </span>
      )}
    </>
  );

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 h-10 flex items-center justify-center px-4 text-sm gap-2"
      style={{
        backgroundColor: banner.backgroundColor,
        color: banner.textColor,
      }}
    >
      {banner.linkUrl ? (
        <a
          href={banner.linkUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity"
          style={{ color: banner.textColor }}
        >
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          {content}
        </div>
      )}

      {banner.showCloseButton && (
        <button
          onClick={dismissBanner}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-75 transition-opacity"
          style={{ color: banner.textColor }}
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default TopBanner;