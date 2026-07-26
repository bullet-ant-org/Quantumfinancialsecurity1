import React from 'react';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Sec2 from '../components/Sec2';
import Portfolio from '../components/Portfolio';
import Testimonials from '../components/Testimonials';
import Faq from '../components/Faq';

const Landing = () => {
  return (
    <div className="landing-page">
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <Sec2 />
      <Portfolio />
      <Testimonials />
      <Faq />
    </div>
  );
};

export default Landing;
