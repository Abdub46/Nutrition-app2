import React from 'react';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Grace Wanjiku',
    location: 'Nairobi, Kenya',
    


    photo: 'https://api.dicebear.com/9.x/personas/svg',



    quote:
      'Horizon+ completely changed how I think about food. The articles are practical and the BMI tracker keeps me accountable every week.',
  },
  {
    name: 'Brian Otieno',
    location: 'Kisumu, Kenya',
    photo: 'https://api.dicebear.com/9.x/personas/svg',
    quote:
      'My counselling sessions were personal and genuinely helpful. I finally have a nutrition plan that fits my everyday life.',
  },
];

const Testimonials = () => {
  return (
    <section className="relative py-24 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 text-center mb-16">What Our Clients Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TESTIMONIALS.map(({ name, location, photo, quote }) => (
            <div
              key={name}
              className="relative bg-white rounded-3xl shadow-md border border-gray-100 p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <Quote size={32} className="text-accent-200 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <img
                  src={photo}
                  alt={`${name} portrait`}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-primary-900">{name}</p>
                  <p className="text-xs text-gray-500">{location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;