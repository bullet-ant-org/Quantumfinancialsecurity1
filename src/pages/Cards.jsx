import React, { useState, useEffect } from 'react';
import CardDetailsModal from '../components/CardDetailsModal';
import './Cards.css';
import Bronzecard from '../assets/Cardbronze.png';
import Silvercard from '../assets/Cardsilver.png';
import Goldcard from '../assets/Cardgold.png';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';

const BRONZE_MIN_BALANCE = 10000;
const SILVER_MIN_BALANCE = 50000;
const GOLD_MIN_BALANCE = 100000;

const cardData = [
  {
    name: 'Bronze',
    tier: 'bronze',
    minBalance: BRONZE_MIN_BALANCE,
    image: Bronzecard,
    tagline: 'For getting started',
    description: 'A solid foundation for everyday spending, with no strings attached.',
    points: [
      '1% cashback on all purchases',
      'Basic travel insurance coverage',
      '24/7 customer support',
      'Contactless payments enabled',
      'No annual fee for the first year',
    ],
  },
  {
    name: 'Silver',
    tier: 'silver',
    minBalance: SILVER_MIN_BALANCE,
    image: Silvercard,
    tagline: 'Most popular',
    featured: true,
    description: 'Enhanced rewards and everyday perks for the frequent spender.',
    points: [
      '3% cashback on dining and travel',
      'Comprehensive travel & rental insurance',
      'Airport lounge access (2 visits/year)',
      'Dedicated concierge service',
      'Higher credit limits',
    ],
  },
  {
    name: 'Gold',
    tier: 'gold',
    minBalance: GOLD_MIN_BALANCE,
    image: Goldcard,
    tagline: 'For the power user',
    description: 'Our top tier — built for clients who expect the best, everywhere.',
    points: [
      '5% cashback on all purchases',
      'Premium global travel insurance',
      'Unlimited worldwide lounge access',
      'Personalized 24/7 global concierge',
      'Priority access to exclusive events',
    ],
  },
];

const PricingCard = ({ card, portfolio, onApply, onViewMore }) => {
  const isEligible = portfolio?.totalValue >= card.minBalance;
  const userBalance = portfolio?.totalValue ?? 0;

  return (
    <div className={`pricing-card ${card.tier} ${card.featured ? 'featured' : ''}`}>
      {card.featured && <span className="pricing-card__ribbon">Most popular</span>}

      <div className="pricing-card__art">
        <img src={card.image} alt={`${card.name} card`} />
      </div>

      <div className="pricing-card__heading">
        <span className="pricing-card__tagline">{card.tagline}</span>
        <h3>{card.name}</h3>
        <p>{card.description}</p>
      </div>

      <div className="pricing-card__requirement">
        <span>Minimum balance</span>
        <strong>${card.minBalance.toLocaleString()}</strong>
      </div>

      <ul className="pricing-card__features">
        {card.points.map((point) => (
          <li key={point}>
            <span className="material-symbols-outlined">check_circle</span>
            {point}
          </li>
        ))}
      </ul>

      <div className="pricing-card__actions">
        <button className="pricing-card__ghost" onClick={() => onViewMore(card)}>
          View details
        </button>
        <button
          className="pricing-card__cta"
          onClick={() => onApply(card)}
          disabled={!isEligible}
        >
          {isEligible ? (
            <>Apply now <span className="material-symbols-outlined">arrow_forward</span></>
          ) : (
            <>Need ${(card.minBalance - userBalance).toLocaleString()} more</>
          )}
        </button>
      </div>
    </div>
  );
};

const CardsPage = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [cardForBalanceCheck, setCardForBalanceCheck] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const portfolioRes = await fetch(`${apiUrl}/portfolio`, { headers });
        if (!portfolioRes.ok) throw new Error('Failed to fetch portfolio data.');
        const portfolioData = await portfolioRes.json();
        setPortfolio(portfolioData);
      } catch (err) {
        console.error('Error fetching portfolio:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [apiUrl, token]);

  const handleViewMore = (card) => setSelectedCard(card);

  const handleCloseModal = () => {
    setSelectedCard(null);
    setShowBalanceModal(false);
    setCardForBalanceCheck(null);
  };

  const handleApply = (card) => {
    if (portfolio && portfolio.totalValue >= card.minBalance) {
      applyForCard(card.tier);
    } else {
      setCardForBalanceCheck(card);
      setShowBalanceModal(true);
    }
  };

  const applyForCard = async (cardTier) => {
    try {
      const res = await fetch(`${apiUrl}/users/apply-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardStatus: cardTier.charAt(0).toUpperCase() + cardTier.slice(1) }),
      });
      if (!res.ok) throw new Error('Failed to apply for the card.');
      setNotification({ type: 'success', message: `Application submitted for the ${cardTier} card!` });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="cards-page-container">
        <div className="cards-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading your card options\u2026</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cards-page-container">
      {notification && (
        <div className={`cards-toast ${notification.type}`}>
          <span className="material-symbols-outlined">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {notification.message}
        </div>
      )}

      <div className="pricing-hero">
        <span className="pricing-hero__eyebrow">Cards</span>
        <h1>A card for every stage of your journey</h1>
        <p>
          Every tier is linked directly to your wallet balance — no separate top-ups, no hidden
          fees. Pick the one that matches where you are today.
        </p>
      </div>

      <div className="pricing-grid">
        {cardData.map((card) => (
          <PricingCard
            key={card.name}
            card={card}
            portfolio={portfolio}
            onApply={handleApply}
            onViewMore={handleViewMore}
          />
        ))}
      </div>

      {selectedCard && (
        <CardDetailsModal card={selectedCard} onApply={handleApply} onClose={handleCloseModal} />
      )}

      {showBalanceModal && cardForBalanceCheck && (
        <InsufficientBalanceModal
          onClose={handleCloseModal}
          requiredBalance={cardForBalanceCheck.minBalance}
          currentBalance={portfolio?.totalValue ?? 0}
        />
      )}
    </div>
  );
};

export default CardsPage;
