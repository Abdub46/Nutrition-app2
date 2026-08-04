import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HomeHero = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background photography */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1800&q=80')",
        }}
        role="img"
        aria-label="Fresh vegetables, fruits and healthy meals in natural light"
      />
      {/* Overlay: darker on the left for text legibility, fading out toward the right so the photography dominates */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 via-primary-900/55 to-primary-900/10" />
      <div className="absolute inset-0 bg-primary-900/10" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 w-full pt-24">
        <div className="max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 mb-6 animate-[fadeInUp_0.8s_ease-out]">
            <span className="h-px w-8 bg-accent-400/80" />
            <span className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.2em] text-white/90 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
              Long-Term Health &amp; Wellness
            </span>
            <span className="h-px w-8 bg-accent-400/80" />
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 animate-[fadeInUp_0.8s_ease-out_0.1s_both]">
            Eat Better.
            <br />
            <span className="text-accent-400">Live Better.</span>
          </h1>

          <p className="text-base md:text-lg text-white/85 leading-relaxed mb-10 max-w-md animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
            Discover evidence-based nutrition articles, healthy recipes, practical wellness tips, and expert
            guidance to help you make informed food choices every day.
          </p>

          <div className="flex flex-wrap items-center gap-6 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-full px-7 py-3.5 shadow-lg shadow-accent-900/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Explore Articles <ArrowRight size={16} />
            </Link>
            <a
              href="#why-choose-us"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full px-7 py-3.5 transition-all duration-300 hover:-translate-y-0.5"
            >
              About Horizon <ArrowRight size={16} />
            </a>


           


          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-white/70 animate-bounce">
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <span className="h-8 w-px bg-white/50" />
      </div>
    </section>
  );
};

export default HomeHero;