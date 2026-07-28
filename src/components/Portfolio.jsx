import React, { useState, useEffect, useRef, useCallback } from "react";
import './Portfolio.css';

const AnimatedNumber = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 1800;
          const end = value;
          if (start === end) return;

          let startTime = null;
          const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCurrentValue(Math.floor(progress * (end - start) + start));
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{currentValue.toLocaleString()}</span>;
};

const STAT_CARDS = [
  { key: 'usersEnrolled', icon: 'group', label: 'Users enrolled', prefix: '' },
  { key: 'totalAssetCap', icon: 'account_balance', label: 'Total asset cap', prefix: '$' },
  { key: 'humanitarianProjects', icon: 'volunteer_activism', label: 'Humanitarian projects', prefix: '' },
];

const ALLOCATION = [
  { name: 'Bitcoin', pct: 32, color: '#f2a900' },
  { name: 'Ethereum', pct: 24, color: '#627eea' },
  { name: 'Stellar (XLM)', pct: 20, color: '#00e1ff' },
  { name: 'Ripple (XRP)', pct: 14, color: '#23292f' },
  { name: 'Cardano', pct: 10, color: '#0033ad' },
];

const Portfolio = () => {
  const [stats, setStats] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/stats/platform`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const fetchedStats = await res.json();
      setStats(fetchedStats);
    } catch (error) {
      console.error("Could not load platform stats:", error);
      setStats({ usersEnrolled: 170000, totalAssetCap: 76000000, humanitarianProjects: 2000 });
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <section id="portfolio" className="reach-section">
      <div className="container">
        <div className="section-heading">
          <span className="section-eyebrow">Our reach</span>
          <h2>Trusted at scale</h2>
          <p>Real numbers from a platform built for people who move real money.</p>
        </div>

        <div className="reach-stats">
          {STAT_CARDS.map((card) => (
            <div className="reach-stat-card" key={card.key}>
              <span className="reach-stat-card__icon material-symbols-outlined">{card.icon}</span>
              <span className="reach-stat-card__value">
                {card.prefix}{stats ? <AnimatedNumber value={stats[card.key]} /> : '0'}
              </span>
              <span className="reach-stat-card__label">{card.label}</span>
            </div>
          ))}
        </div>

        <div className="reach-allocation">
          <div className="reach-allocation__heading">
            <h3>Where balances are held</h3>
            <p>Aggregate distribution of assets held across all connected wallets.</p>
          </div>
          <div className="reach-allocation__bars">
            {ALLOCATION.map((a) => (
              <div className="allocation-row" key={a.name}>
                <div className="allocation-row__top">
                  <span className="allocation-row__name">
                    <span className="allocation-row__dot" style={{ background: a.color }} />
                    {a.name}
                  </span>
                  <span className="allocation-row__pct">{a.pct}%</span>
                </div>
                <div className="allocation-row__track">
                  <div
                    className="allocation-row__fill"
                    style={{ width: `${a.pct}%`, background: a.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
