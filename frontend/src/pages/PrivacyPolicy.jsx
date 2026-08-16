import React from 'react';
import Seo from '../components/Seo';

const PrivacyPolicy = () => {
  return (
    <div className="pt-4 max-w-3xl mx-auto space-y-8">
      <Seo
        title="Privacy Policy"
        path="/privacy-policy"
        description="How Horizon+ collects, uses, and protects your personal and health information."
      />
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: August 2026</p>
      </div>

      <div className="card space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>
          Horizon+ is a nutrition and wellness counselling platform. This policy explains what information we
          collect when you use the app, how we use it, and the choices you have.
        </p>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account details you provide when signing up - name, email, phone number, and password.</li>
            <li>
              Nutrition profile information - date of birth, sex, occupation, location, height, weight, medical
              history, dietary habits, and lifestyle answers you give us, used to personalize your BMI insights and
              chatbot guidance.
            </li>
            <li>Appointment details when you book a counselling session.</li>
            <li>Messages you send to the AI Nutrition Assistant or through the Suggest Improvement form.</li>
            <li>A profile photo, if you choose to upload one.</li>
            <li>If you sign in with Google, the name, email, and profile photo Google shares with us.</li>
            <li>Basic, anonymous usage data (pages visited, device type) used to understand how the app is used.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">How We Use It</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To calculate your BMI, track your trends, and personalize dashboard insights.</li>
            <li>To power the AI Nutrition Assistant's responses to you.</li>
            <li>To schedule and manage your counselling appointments.</li>
            <li>To send account-related emails (password resets, appointment updates) and, if you opt in, our newsletter.</li>
            <li>To review and act on suggestions you send us.</li>
            <li>To understand overall platform usage and improve the app.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">How We Protect It</h2>
          <p>
            Passwords are never stored in plain text. Your login session is kept in a secure, browser-managed cookie
            rather than anywhere a script on the page could read it. We don't sell your personal or health
            information to anyone.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Third-Party Services We Use</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Google Sign-In, if you choose to use it - governed by Google's own privacy policy.</li>
            <li>Cloudinary, to host uploaded images such as profile photos and article graphics.</li>
            <li>An AI provider, to generate the Nutrition Assistant's chat responses.</li>
            <li>An email delivery service, for password resets, appointment notices, and the newsletter.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Your Choices</h2>
          <p>
            You can review and update most of your profile information anytime from your Dashboard. You can
            unsubscribe from the newsletter at any time using the link in any newsletter email. To request that your
            account and data be deleted, contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Children's Privacy</h2>
          <p>Horizon+ is intended for adults and is not directed at children.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Continuing to use Horizon+ after a change means you accept
            the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Contact Us</h2>
          <p>
            Questions about this policy or your data? Reach out via the{' '}
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

export default PrivacyPolicy;