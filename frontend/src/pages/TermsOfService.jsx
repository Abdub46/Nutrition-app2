import React from 'react';
import Seo from '../components/Seo';

const TermsOfService = () => {
  return (
    <div className="pt-4 max-w-3xl mx-auto space-y-8">
      <Seo
        title="Terms of Use"
        path="/terms-of-service"
        description="The terms that govern your use of the Horizon+ nutrition and wellness platform."
      />
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Terms of Use</h1>
        <p className="text-sm text-gray-500 mt-1">Last updated: August 2026</p>
      </div>

      <div className="card space-y-6 text-sm text-gray-600 leading-relaxed">
        <p>
          These terms govern your use of Horizon+. By creating an account or using the app, you agree to them.
        </p>

        <section className="card bg-amber-50/60 border-amber-100">
          <h2 className="font-semibold text-gray-800 text-base mb-2">Not a Substitute for Medical Care</h2>
          <p>
            Horizon+ provides general nutrition and lifestyle guidance for informational purposes only. Neither the
            AI Nutrition Assistant nor our counsellors diagnose medical conditions or prescribe medication. Always
            consult a qualified healthcare professional for medical concerns, and don't delay seeking medical advice
            because of something you read or were told on this platform.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Who Can Use Horizon+</h2>
          <p>
            You must be an adult capable of entering a binding agreement to create an account, and the information
            you provide must be accurate. You're responsible for keeping your login credentials secure and for
            activity on your account.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Acceptable Use</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Don't use the chatbot, comments, or suggestion form to submit harmful, abusive, or illegal content.</li>
            <li>Don't attempt to interfere with or breach the platform's security.</li>
            <li>Don't misrepresent your identity or impersonate someone else.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Content</h2>
          <p>
            Articles and other content published by Horizon+ writers remain the property of Horizon+. Anything you
            submit through comments or the suggestion form may be used to improve the platform.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Appointments</h2>
          <p>
            Booking an appointment through Horizon+ requests time with a nutrition counsellor; it doesn't guarantee
            availability until it's confirmed. Appointment status is visible on your Appointments page.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms or misuse the platform.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Limitation of Liability</h2>
          <p>
            Horizon+ is provided "as is." We aren't liable for decisions made based on general guidance provided
            through the app - always use your own judgment and consult a professional for anything medical.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Changes to These Terms</h2>
          <p>We may update these terms from time to time. Continuing to use Horizon+ means you accept the changes.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 text-base mb-2">Contact Us</h2>
          <p>
            Questions about these terms? Reach out via the{' '}
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

export default TermsOfService;