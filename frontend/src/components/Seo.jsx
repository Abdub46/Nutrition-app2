import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Horizon+';
const DEFAULT_DESCRIPTION =
  'Horizon+ is a nutrition and wellness counselling platform - track your BMI, get personalized meal guidance, chat with a nutrition assistant, and book a session with a counsellor.';
const DEFAULT_IMAGE = '/icons/icon-512.png';

/**
 * Sets this page's <title>, meta description, canonical URL, and Open
 * Graph/Twitter tags. Drop one near the top of any page component - every
 * prop is optional and falls back to a sensible site-wide default.
 *
 * noIndex: pass this for anything that sits behind a login (dashboard,
 * chatbot, admin, etc.). robots.txt already disallows crawling those paths
 * outright, so this is a second, page-level signal for anything that slips
 * through (e.g. a shared or bookmarked link) - it also skips the canonical
 * tag, since a page search engines shouldn't index doesn't need one either.
 */
const Seo = ({ title, description = DEFAULT_DESCRIPTION, path, image = DEFAULT_IMAGE, type = 'website', noIndex = false }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Nutrition & Wellness Counselling`;
  const url = typeof window !== 'undefined' ? `${window.location.origin}${path || window.location.pathname}` : path;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : <link rel="canonical" href={url} />}

      {/* Open Graph - powers link previews on WhatsApp, Facebook, LinkedIn, etc. */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default Seo;