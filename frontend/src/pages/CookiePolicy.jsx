import React from 'react';
import Seo from '../components/Seo';

const CookiePolicy = () => {
  return (
    <div className="pt-4 max-w-3xl mx-auto space-y-8">
      <Seo
        title="Cookie Policy"
        path="/cookie-policy"
        description="How Horizon+ uses cookies and similar browser storage."
      />
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: August 2026</p>
      </div>

      <div className="card space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>
          Cookies are small pieces of data a website asks your browser to store. Here's what Horizon+ actually uses,
          in plain terms.
        </p>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">The Cookie We Use</h2>
          <p>
            When you log in, we set a single, strictly necessary cookie that keeps you signed in. It's marked
            httpOnly, meaning no script running on the page - including a malicious one - can read it; only your
            browser and our server can see it. Blocking or clearing this cookie will sign you out.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">What We Don't Use Cookies For</h2>
          <p>
            We don't use advertising or third-party tracking cookies. If you sign in with Google, Google may set its
            own cookies as part of that process - those are governed by Google's own cookie and privacy policies,
            not ours.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Anonymous Usage Data</h2>
          <p>
            To understand which pages are used, we generate a random identifier stored in your browser's session
            storage (not a cookie) when you visit, and use it to anonymously count page views for that browsing
            session. This identifier isn't linked to your name or account and clears when you close the tab.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Managing Cookies</h2>
          <p>
            You can clear or block cookies at any time through your browser's settings. Since our one cookie is what
            keeps you logged in, doing so will simply log you out - it won't break anything else about the site.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Changes to This Policy</h2>
          <p>We may update this policy if how we use cookies changes. Check back here for the latest version.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Contact Us</h2>
          <p>
            Questions about this policy? Reach out via the{' '}
            <a href="#footer" className="text-primary-600 hover:underline">
              contact details in our footer
            </a>
            , or use the Suggest Improvement page.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;