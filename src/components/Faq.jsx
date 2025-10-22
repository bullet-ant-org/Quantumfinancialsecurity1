import React, { useState } from 'react';
import './Faq.css';

const Faq = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    { q: 'What is the Quantum Financial System (QFS)?', a: 'The QFS is a theoretical financial framework, often described in esoteric and conspiracy theory communities, that is said to be backed by gold and other assets, replacing the current central banking system.' },
    { q: 'How can I enroll in the QFS?', a: 'Enrollment processes are typically outlined by community leaders. It usually involves registering your assets and personal information on a designated platform to be included in the new system.' },
    { q: 'Is my data secure on this platform?', a: 'We use state-of-the-art quantum encryption and decentralized storage to ensure the highest level of security for your personal and financial data.' },
    { q: 'What assets can be managed here?', a: 'Our platform supports a wide range of digital and tokenized assets, including major cryptocurrencies like Bitcoin and Ethereum, as well as tokenized real-world assets.' },
    { q: 'How are humanitarian projects funded?', a: 'A portion of the platform\'s revenue and newly generated assets within the QFS are allocated to fund various humanitarian and infrastructure projects worldwide.' },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <h2 className="text-center mb-5 text-white">Frequently Asked Questions</h2>
        <div className="accordion">
          {faqData.map((faq, index) => (
            <div className="accordion-item" key={index}><div className="accordion-header" onClick={() => toggleFaq(index)}><h3>{faq.q}</h3><span className={`accordion-icon ${openFaq === index ? 'open' : ''}`}></span></div><div className={`accordion-content ${openFaq === index ? 'open' : ''}`}><p>{faq.a}</p></div></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;