import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  LayoutDashboard,
  Calculator,
  MessageCircle,
  CalendarHeart,
  Newspaper,
  Wrench,
  Lightbulb,
} from 'lucide-react';

const STEPS = [
  {
    icon: UserPlus,
    title: '1. Create an account',
    description:
      "Sign up with your details, including basic health and lifestyle information. This profile powers your BMI insights, dashboard, and personalized chatbot advice. Already have an account? Just log in.",
    link: { to: '/signup', label: 'Go to Sign Up' },
  },
  {
    icon: LayoutDashboard,
    title: '2. Check your Dashboard',
    description:
      'After logging in, your Dashboard is home base — it shows your BMI trend over time and an auto-generated insight about your progress.',
    link: { to: '/dashboard', label: 'Open Dashboard' },
  },
  {
    icon: Calculator,
    title: '3. Track your BMI',
    description:
      'Use the BMI Calculator to log a new weight. Every entry is saved to your history so your dashboard trend graph stays up to date.',
    link: { to: '/bmi-calculator', label: 'Open BMI Calculator' },
  },
  {
    icon: MessageCircle,
    title: '4. Ask the Nutrition Chatbot',
    description:
      'Chat with the AI Nutrition Assistant for personalized nutrition and lifestyle guidance based on your profile. It will never diagnose conditions or prescribe medication — for that, book an appointment.',
    link: { to: '/chatbot', label: 'Open Chatbot' },
  },
  {
    icon: CalendarHeart,
    title: '5. Book a counselling appointment',
    description:
      'Need one-on-one guidance? Book an Online or Physical appointment with a nutrition counsellor and track its status (Pending, Approved, Completed).',
    link: { to: '/appointments', label: 'Book an Appointment' },
  },
  {
    icon: Newspaper,
    title: '6. Read nutrition articles',
    description:
      'Browse the Articles hub for evidence-based nutrition and wellness content, organized by category, with a featured article on the homepage.',
    link: { to: '/articles', label: 'Browse Articles' },
  },
  {
    icon: Wrench,
    title: '7. Use the quick calculators',
    description:
      'The Tools page offers standalone BMI, water intake, and calorie requirement calculators — no login required and nothing is saved to your profile.',
    link: { to: '/tools', label: 'Open Tools' },
  },
  {
    icon: Lightbulb,
    title: '8. Share feedback',
    description:
      "Have an idea for how we can improve the app? Use the Suggest Improvement page to send us a message directly — your registered email is attached automatically.",
    link: { to: '/suggest-improvement', label: 'Suggest an Improvement' },
  },
];

const HowToUse = () => {
  return (
    <div className="pt-4 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">How to Use Horizon+</h1>
        <p className="text-sm text-gray-500 mt-1">
          A quick walkthrough of the app so you can navigate everything seamlessly, from signing up to getting
          personalized nutrition guidance.
        </p>
      </div>

      <div className="space-y-4">
        {STEPS.map(({ icon: Icon, title, description, link }) => (
          <div key={title} className="card flex gap-4">
            <div className="shrink-0 h-11 w-11 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{description}</p>
              {link && (
                <Link to={link.to} className="inline-block text-sm font-medium text-primary-700 hover:text-primary-800 mt-2">
                  {link.label} &rarr;
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-primary-50/60">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Tip:</span> You can always get back to any page using the navigation bar at
          the top, and the footer below has quick links to the most-used sections.
        </p>
      </div>
    </div>
  );
};

export default HowToUse;