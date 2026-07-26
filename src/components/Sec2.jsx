import React from 'react';
import Emoji from '../assets/bitcoin.jpg';
import './Sec2.css';

const POINTS = [
  {
    icon: 'sync_alt',
    text: 'Track your portfolio with real-time balance updates pulled directly from-chain.',
  },
  {
    icon: 'vpn_key',
    text: 'Private keys never leave your session — access to funds is yours alone.',
  },
  {
    icon: 'schedule',
    text: 'Move assets 24/7, independent of banking hours or intermediaries.',
  },
];

const Sec2 = () => {
  return (
    <section id="security" className="security-section">
      <div className="container">
        <div className="security-grid">
          <div className="security-image">
            <img src={Emoji} alt="Secured digital assets" />
          </div>
          <div className="security-copy">
            <span className="section-eyebrow">Security</span>
            <h2>Bank-grade custody, without the bank</h2>
            <p>
              Every wallet is protected by industry-standard encryption and a
              non-custodial architecture, so a breach of our servers can never
              expose your private keys.
            </p>
            <ul className="security-points">
              {POINTS.map((p) => (
                <li key={p.text}>
                  <span className="material-symbols-outlined">{p.icon}</span>
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
            <a href="#faq" className="security-link">
              Read the security FAQ
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sec2;
