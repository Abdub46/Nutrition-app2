import React, { useEffect, useRef } from 'react';

/**
 * Renders Google's own "Sign in with Google" button via Google Identity
 * Services (the <script> tag lives in index.html). Calls onCredential with
 * the raw Google ID token once the user picks an account - the parent page
 * is responsible for POSTing that token to /api/auth/google.
 */
const GoogleSignInButton = ({ onCredential, text = 'continue_with' }) => {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return undefined;

    let cancelled = false;
    let pollId;

    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 320,
        text,
      });
    };

    if (window.google?.accounts?.id) {
      render();
    } else {
      // index.html loads the GSI script with async/defer, so it may not be
      // ready yet on first render - poll briefly until it is.
      pollId = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(pollId);
          render();
        }
      }, 100);
      setTimeout(() => clearInterval(pollId), 10000);
    }

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, text]);

  if (!clientId) return null;

  return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleSignInButton;