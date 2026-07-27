import React, { useState } from 'react';
import './Faq.css';

const FAQ_DATA = [
  {
    q: 'Do you ever hold my private keys?',
    a: 'No. QuantumFS is non-custodial — your wallet is generated and secured on your own device. We never store, transmit, or have access to your recovery phrase or private keys.',
  },
  {
    q: 'Which assets can I manage on the platform?',
    a: 'You can hold, send, and receive Bitcoin, Stellar (XLM), Ripple (XRP), and stablecoins like USDT, all from a single portfolio dashboard.',
  },
  {
    q: 'How do I get started?',
    a: 'Create an account, then either import an existing wallet with your recovery phrase or generate a new one in a single step. Your portfolio and dashboard are ready immediately after.',
  },
  {
    q: 'What happens if I lose access to my account?',
    a: 'Open a support ticket from the dashboard and a specialist will verify your identity and help restore access. Because we never hold your keys, recovery always depends on your own backup of your recovery phrase.',
  },
  {
    q: 'Can I dispute a transaction?',
    a: 'Yes. Every transaction can be flagged for review from your transaction history, and you can attach evidence and track the resolution status directly in your dashboard.',
  },
  {
    q: 'Is there a spending card linked to my wallet?',
    a: 'Yes, once your account is verified you can apply for a Bronze, Silver, or Gold card tied directly to your wallet balance for everyday spending.',
  },
];

const Faq = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <div className="section-heading">
          <span className="section-eyebrow">Support</span>
          <h2>Frequently asked questions</h2>
          <p>Still curious about something? Open a ticket from your dashboard any time.</p>
        </div>

        <div className="accordion">
          {FAQ_DATA.map((faq, index) => (
            <div className={`accordion-item ${openFaq === index ? 'open' : ''}`} key={faq.q}>
              <button className="accordion-header" onClick={() => toggleFaq(index)}>
                <h3>{faq.q}</h3>
                <span className={`accordion-icon ${openFaq === index ? 'open' : ''}`}>
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </button>
              <div className={`accordion-content ${openFaq === index ? 'open' : ''}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
