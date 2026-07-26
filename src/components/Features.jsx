import React from 'react';
import './Features.css';

const FEATURES = [
  {
    icon: 'fingerprint',
    title: 'Self-custody by default',
    desc: 'Private keys are generated and held on your device. We never see, store, or move your secret phrase without your signature.',
    big: true,
  },
  {
    icon: 'payments',
    title: 'Multi-currency vaults',
    desc: 'Hold and settle in Bitcoin, Stellar, Ripple, and stablecoins from a single portfolio view.',
  },
  {
    icon: 'support_agent',
    title: '24/7 human support',
    desc: 'A ticketing system with real specialists — not a bot loop — for anything from disputes to card activation.',
  },
  {
    icon: 'monitoring',
    title: 'Live portfolio tracking',
    desc: 'Real-time balances, transaction history, and asset distribution, refreshed straight from-chain.',
  },
  {
    icon: 'credit_card',
    title: 'Tiered spending cards',
    desc: 'Bronze, Silver, and Gold cards linked directly to your wallet balance for everyday spending.',
  },
  {
    icon: 'gavel',
    title: 'Built-in dispute resolution',
    desc: 'Flag a transaction, attach evidence, and track resolution status without leaving the dashboard.',
  },
];

const Features = () => {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-heading">
          <span className="section-eyebrow">Platform</span>
          <h2>Everything you need to hold assets safely</h2>
          <p>
            One dashboard for custody, movement, and support — designed so the
            controls that matter are never more than a click away.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className={`feature-card ${f.big ? 'feature-card--wide' : ''}`} key={f.title}>
              <span className="feature-card__icon material-symbols-outlined">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
