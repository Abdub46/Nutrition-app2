import React, { useEffect } from 'react';
import Seo from '../components/Seo';
import HomeNavbar from '../components/home/HomeNavbar';
import HomeHero from '../components/home/HomeHero';
import WhatWeDo from '../components/home/WhatWeDo';
import WhyChooseUs from '../components/home/WhyChooseUs';
import FeaturedArticle from '../components/home/FeaturedArticle';
import Testimonials from '../components/home/Testimonials';
import HomeFooter from '../components/home/HomeFooter';

const Home = () => {
  // The homepage leans on generous white space, so the subtle site-wide grid pattern
  // (applied globally in index.css) is switched off only while this page is mounted.
  useEffect(() => {
    document.body.classList.add('home-no-grid');
    return () => document.body.classList.remove('home-no-grid');
  }, []);

  return (
    <div className="bg-white">
      <Seo
        path="/"
        description="Horizon+ is a premium nutrition and wellness platform - personalized meal guidance, BMI tracking, an AI nutrition assistant, and one-on-one counselling."
      />
      <HomeNavbar transparentOnTop />
      <HomeHero />
      <WhatWeDo />
      <WhyChooseUs />
      <FeaturedArticle />
      <Testimonials />
      <HomeFooter />
    </div>
  );
};

export default Home;