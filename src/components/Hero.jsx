import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-backdrop" />
      <div className="hero-glow hero-glow--one" />

      <div className="container hero-content">
        <span className="hero-eyebrow">
          <span className="hero-eyebrow__dot" />
          Non-custodial · Multi-chain · Audited
        </span>

        <h1 className="hero-title">
          Your assets, secured for
          <span className="hero-title__gradient"> whatever comes next.</span>
        </h1>

        <p className="hero-subtitle">
          Quantum Financial Security is a self-custody portal for backing up, moving,
          and monitoring your digital assets across chains — with bank-grade
          safeguards you actually control.
        </p>

        <div className="hero-actions">
          <Link to="/login" className="hero-btn hero-btn--primary">
            Secure my assets
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <a href="#how-it-works" className="hero-btn hero-btn--ghost">
            See how it works
          </a>
        </div>

        <div className="hero-trust">
          <div className="hero-trust__item">
            <span className="material-symbols-outlined">shield_lock</span>
            256-bit encrypted vaults
          </div>
          <div className="hero-trust__item">
            <span className="material-symbols-outlined">key</span>
            You hold the keys
          </div>
          <div className="hero-trust__item">
            <span className="material-symbols-outlined">bolt</span>
            Settles in seconds
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
