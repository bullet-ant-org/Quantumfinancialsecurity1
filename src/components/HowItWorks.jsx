import React from 'react';
import './HowItWorks.css';

const STEPS = [
  {
    n: '01',
    title: 'Create your account',
    desc: 'Sign up with an email and password. Your profile and portfolio are provisioned instantly.',
  },
  {
    n: '02',
    title: 'Connect or generate a wallet',
    desc: 'Import an existing wallet with your recovery phrase, or generate a new Stellar / Ripple address in one step.',
  },
  {
    n: '03',
    title: 'Fund and monitor',
    desc: 'Deposit, receive, or send assets, then track balances and history from a single live dashboard.',
  },
  {
    n: '04',
    title: 'Spend or escalate',
    desc: 'Apply for a spending card when you are ready, or open a ticket / dispute any time you need help.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="how-section">
      <div className="container">
        <div className="section-heading">
          <span className="section-eyebrow">Onboarding</span>
          <h2>From sign-up to secured in four steps</h2>
          <p>No branches, no paperwork. The whole flow happens inside your dashboard.</p>
        </div>

        <div className="how-steps">
          {STEPS.map((s, i) => (
            <div className="how-step" key={s.n}>
              <div className="how-step__marker">
                <span>{s.n}</span>
                {i !== STEPS.length - 1 && <div className="how-step__line" />}
              </div>
              <div className="how-step__body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
