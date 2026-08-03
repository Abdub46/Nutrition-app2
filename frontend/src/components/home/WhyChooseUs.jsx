import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const BENEFITS = [
  {
    title: 'Evidence-Based Guidance',
    description: 'Every article and recommendation is grounded in credible nutrition science, not fads or guesswork.',
  },
  {
    title: 'Personalized Support',
    description: 'One-on-one counselling tailored to your goals, lifestyle, and health history.',
  },
  {
    title: 'Practical & Easy to Follow',
    description: 'Clear, actionable tools like BMI tracking that fit naturally into your daily routine.',
  },
  {
    title: 'Your Health, Our Priority',
    description: 'A trustworthy platform built around your long-term wellbeing, not quick fixes.',
  },
];

const WhyChooseUs = () => {
  return (
    <section id="why-choose-us" className="relative py-24 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80"
                alt="A friendly nutritionist consulting with a client, surrounded by healthy foods in a bright clinic"
                className="w-full h-[420px] md:h-[480px] object-cover"
                loading="lazy"
              />
            </div>
            <div className="hidden md:block absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4">
              <p className="text-2xl font-bold text-primary-900">10+ yrs</p>
              <p className="text-xs text-gray-500">of trusted nutrition guidance</p>
            </div>
          </div>

          {/* Right content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Why Choose Horizon+</h2>
            <p className="text-gray-500 leading-relaxed mb-10 max-w-lg">
              We are committed to helping you build sustainable healthy habits through trustworthy information,
              personalized support, and easy-to-use digital tools.
            </p>

            <div className="space-y-4">
              {BENEFITS.map(({ title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-300 hover:border-accent-200 hover:shadow-md"
                >
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle2 size={22} className="text-accent-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;