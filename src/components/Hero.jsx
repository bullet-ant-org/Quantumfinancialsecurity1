import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const Hero = () => {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log("Particles container loaded", container);
  };

  const particlesOptions = useMemo(() => ({
    fullScreen: {
      enable: false,
    },
    background: {
      color: {
        value: "black", // A dark, professional background
      },
    },
    fpsLimit: 90,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 20,
        },
        value: 250,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  }), []);

  if (!init) {
    return null; // or a loading spinner
  }

  return (
    <div
      className="hero-container mybg"
      style={{
        position: 'relative',
        height: '80vh',
        overflow: 'hidden',
        color: 'white'
      }}
    >
      {/*
        This style block is the key fix. It targets the container div that
        tsparticles creates (using the id="tsparticles") and forces it to
        fill its parent.
      */}
      <style>
        {`
          #tsparticles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        `}
      </style>
      <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={particlesOptions} />

      {/* Hero Content */}
      <div className="container h-100 d-flex flex-column justify-content-center align-items-center text-center" style={{ zIndex: 2, position: 'relative' }}>
        <h1 className="display-3 fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Quantum Financial Security</h1>
        <p className="lead my-4" style={{ maxWidth: '600px', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          QFS portal to backup digital assets and funds for the global event and blackout coming soon!
        </p>
        <Link to="/login" className="btn btn-primary btn-lg rounded-pill px-4" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>Secure now</Link>
      </div>
    </div>
  );
};

export default Hero;
