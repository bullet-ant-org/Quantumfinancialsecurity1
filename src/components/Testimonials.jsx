import React from 'react';
import './Testimonials.css';

const REVIEWS = [
  {
    quote: 'Moving my holdings over took less than ten minutes, and the dispute I raised was resolved the same day.',
    name: 'D. Okafor',
    role: 'Portfolio holder since 2024',
  },
  {
    quote: 'Having balances, cards, and support tickets in one dashboard instead of four apps is the whole reason I switched.',
    name: 'M. Alvarez',
    role: 'Small business owner',
  },
  {
    quote: 'The fact that support is a real person on the ticket, not a bot, made me trust the platform with a larger transfer.',
    name: 'R. Chen',
    role: 'Long-term saver',
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-heading">
          <span className="section-eyebrow">From our users</span>
          <h2>Trusted by people who move real money</h2>
        </div>
        <div className="testimonials-grid">
          {REVIEWS.map((r) => (
            <figure className="testimonial-card" key={r.name}>
              <span className="material-symbols-outlined testimonial-card__quote">format_quote</span>
              <blockquote>{r.quote}</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span>{r.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
