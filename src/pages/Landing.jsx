import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Sec2 from '../components/Sec2'
import Schemes from '../components/Schemes';
import Portfolio from '../components/Portfolio';
import Faq from '../components/Faq';


const Landing = () => {
  return (
    <div className="landing-page">
      
      <Hero />
      {/* Placeholder for other sections */}
      <Schemes />
      <Sec2 />
      <Portfolio />
      <Faq />
    </div>
  );
};

export default Landing;
