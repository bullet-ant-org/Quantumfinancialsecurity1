import React, { useState, useEffect } from 'react';
import CardDetailsModal from '../components/CardDetailsModal';
import './Cards.css';
import Bronzecard from '../assets/Cardbronze.png';
import Silvercard from '../assets/Cardsilver.png';
import Goldcard from '../assets/Cardgold.png';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';

// Minimum balance requirements for each card tier
const BRONZE_MIN_BALANCE = 10000;
const SILVER_MIN_BALANCE = 50000;
const GOLD_MIN_BALANCE = 100000;

const cardData = [
  {
    name: 'Bronze',
    tier: 'bronze',
    minBalance: BRONZE_MIN_BALANCE,
    image: Bronzecard,
    description: 'The essential card for starting your journey. Enjoy foundational benefits and a solid start to your financial growth.',
    points: [
      '1% Cashback on all purchases',
      'Basic travel insurance coverage',
      '24/7 Customer Support',
      'Contactless payments enabled',
      'No annual fee for the first year',
    ],
  },
  {
    name: 'Silver',
    tier: 'silver',
    minBalance: SILVER_MIN_BALANCE,
    image: Silvercard,
    description: 'Elevate your experience with the Silver card, offering enhanced rewards and exclusive perks for the discerning user.',
    points: [
      '3% Cashback on dining and travel',
      'Comprehensive travel and rental car insurance',
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
    description: 'The ultimate card for our premium clients. Access unparalleled benefits, luxury travel perks, and personalized services.',
    points: [
      '5% Cashback on all purchases',
      'Premium global travel insurance',
      'Unlimited airport lounge access worldwide',
      'Personalized 24/7 global concierge',
      'Exclusive access to events and offers',
    ],
  },
];

const CardItem = ({ card, portfolio, onApply, onViewMore }) => {
  const isEligible = portfolio?.totalValue >= card.minBalance;
  const userBalance = portfolio?.totalValue ?? 0;

  return (
    <div className={`card-item ${card.tier}`}>
      {/* Card Header */}
      <div className="card-item-header">
        <div className="card-tier-display">
          <span className="tier-emoji">
            {card.tier === 'bronze' && '🥉'}
            {card.tier === 'silver' && '🥈'}
            {card.tier === 'gold' && '🥇'}
          </span>
          <h3 className="card-item-name">{card.name} Card</h3>
        </div>
        <div className="card-requirements">
          <div className="min-balance-display">
            <span className="balance-label">Min. Balance</span>
            <span className="balance-amount">${card.minBalance.toLocaleString()}</span>
          </div>
          <span className={`eligibility-badge ${isEligible ? 'eligible' : 'ineligible'}`}>
            {isEligible ? '✓ Eligible' : `Need $${(card.minBalance - userBalance).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Card Image */}
      <div className="card-image-section">
        <div className="card-image-container">
          <img src={card.image} alt={`${card.name} card`} className="card-image" />
          {!isEligible && <div className="card-locked-overlay"></div>}
        </div>
      </div>

      {/* Benefits */}
      <div className="card-benefits">
        <h4 className="benefits-title">Key Benefits</h4>
        <div className="benefits-list">
          {card.points.slice(0, 3).map((benefit, index) => (
            <div key={index} className="benefit-item">
              <span className="benefit-check">✓</span>
              <span className="benefit-text">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button className="action-btn view-details" onClick={() => onViewMore(card)}>
          <span className="material-symbols-outlined">visibility</span>
          View Details
        </button>
        <button
          className={`action-btn apply-now ${isEligible ? 'enabled' : 'disabled'}`}
          onClick={() => onApply(card)}
          disabled={!isEligible}
        >
          <span className="material-symbols-outlined">
            {isEligible ? 'credit_card' : 'lock'}
          </span>
          {isEligible ? 'Apply Now' : 'Insufficient Balance'}
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

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };
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

  const handleViewMore = (card) => {
    setSelectedCard(card);
  };

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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cardStatus: cardTier.charAt(0).toUpperCase() + cardTier.slice(1) }),
      });
      if (!res.ok) throw new Error('Failed to apply for the card.');
      alert(`Successfully applied for the ${cardTier} card!`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="cards-page-container">
        <div className="cards-loading">
          <div className="loading-spinner-large"></div>
          <h2>Loading Cards...</h2>
          <p>Preparing your card options</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cards-page-container">
      {/* Hero Section */}
      <div className="cards-hero-section">
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <span className="material-symbols-outlined hero-icon">credit_card</span>
          </div>
          <h1 className="hero-title">Premium Card Collection</h1>
          <p className="hero-subtitle">
            Unlock exclusive benefits and rewards with our premium card tiers. Choose the perfect card for your financial journey.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {cardData.map((card) => (
          <CardItem
            key={card.name}
            card={card}
            portfolio={portfolio}
            onApply={handleApply}
            onViewMore={handleViewMore}
          />
        ))}
      </div>

      {/* Modals */}
      {selectedCard && (
        <CardDetailsModal
          card={selectedCard}
          onApply={handleApply}
          onClose={handleCloseModal}
        />
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
