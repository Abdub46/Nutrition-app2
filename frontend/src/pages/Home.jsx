import React, { useEffect } from 'react';
import HomeNavbar from '../components/home/HomeNavbar';
import HomeHero from '../components/home/HomeHero';
import WhatWeDo from '../components/home/WhatWeDo';
import WhyChooseUs from '../components/home/WhyChooseUs';
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
      <HomeNavbar />
      <HomeHero />
      <WhatWeDo />
      <WhyChooseUs />
      <Testimonials />
      <HomeFooter />
    </div>
  );
};

export default Home;