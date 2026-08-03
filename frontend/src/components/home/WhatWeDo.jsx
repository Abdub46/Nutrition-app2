import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Newspaper, Calculator, CalendarHeart, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Newspaper,
    title: 'Nutrition Articles',
    description:
      'Evidence-based nutrition articles covering healthy eating, disease prevention, and lifestyle wellness.',
    to: '/articles',
  },
  {
    icon: Calculator,
    title: 'BMI Calculation & Monitoring',
    description: 'Calculate your BMI, track your progress, and monitor your health with interactive charts.',
    to: '/bmi-calculator',
  },
  {
    icon: CalendarHeart,
    title: 'One-on-One Counselling',
    description: 'Book appointments with qualified nutrition experts for personalized guidance and nutrition support.',
    to: '/appointments',
  },
];

const WhatWeDo = () => {
  return (
    <section className="relative py-24 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-accent-50 mb-5">
            <Leaf size={20} className="text-accent-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">What We Do</h2>
          <p className="text-gray-500 leading-relaxed">
            We provide practical tools and expert support to help you improve your nutrition and live a healthier
            life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map(({ icon: Icon, title, description, to }) => (
            <div
              key={title}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl p-8 transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="h-14 w-14 rounded-full bg-accent-500 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-primary-900 mb-2.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>
              <Link
                to={to}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:text-accent-700 transition-colors duration-300"
              >
                Learn More <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;