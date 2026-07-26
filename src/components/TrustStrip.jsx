import React from 'react';
import btc from '../assets/bitcoin.jpg';
import usdt from '../assets/usdtlogo.png';
import xlm from '../assets/xlmlogo.png';
import xrp from '../assets/xrplogo.png';
import './TrustStrip.css';

const ASSETS = [
  { name: 'Bitcoin', icon: btc },
  { name: 'Tether (USDT)', icon: usdt },
  { name: 'Stellar (XLM)', icon: xlm },
  { name: 'Ripple (XRP)', icon: xrp },
];

const TrustStrip = () => {
  const row = [...ASSETS, ...ASSETS, ...ASSETS];
  return (
    <section id="trust" className="trust-strip">
      <p className="trust-strip__label">Custody and move assets across the chains you already use</p>
      <div className="trust-strip__track">
        <div className="trust-strip__row">
          {row.map((asset, i) => (
            <span className="trust-strip__chip" key={`${asset.name}-${i}`}>
              <img src={asset.icon} alt="" />
              {asset.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
