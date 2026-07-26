import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import './Hero.css';

const Hero = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 90,
    interactivity: {
      events: { onHover: { enable: true, mode: "repulse" }, resize: true },
      modes: { repulse: { distance: 100, duration: 0.4 } },
    },
    particles: {
      color: { value: "#00e1ff" },
      links: { color: "#00e1ff", distance: 150, enable: true, opacity: 0.15, width: 1 },
      collisions: { enable: false },
      move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 1.2, straight: false },
      number: { density: { enable: true, area: 22 }, value: 160 },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }), []);

  return (
    <section className="hero-section">
      {init && (
        <Particles id="tsparticles" options={particlesOptions} />
      )}
      <div className="hero-glow hero-glow--one" />
      <div className="hero-glow hero-glow--two" />

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

      <a href="#trust" className="hero-scroll-cue" aria-label="Scroll down">
        <span className="material-symbols-outlined">keyboard_arrow_down</span>
      </a>
    </section>
  );
};

export default Hero;
