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
        console.error(err.message);
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
      // Actual apply logic
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
      // Optionally, you can refresh user data here to reflect the new card status
    } catch (err) {
      alert(err.message);
    }
  };

  const userBalance = portfolio?.totalValue ?? 0;

  return (
    <div className="cards-page-container">
      <h1 className="cards-page-title">Our Cards</h1>
      <p className="cards-page-subtitle">Choose the card that best fits your lifestyle and financial goals.</p>
      <div className="cards-grid">
        {cardData.map((card) => (
          <div key={card.name} className={`qfs-card ${card.tier}`}>
            {!loading && userBalance < card.minBalance && <div className="card-overlay-disabled"></div>}
            <div className="card-content">
              <div className="card-header">
                <h2 className="card-name">{card.name}</h2>
                <p className="card-min-balance">
                  Min. Balance: ${card.minBalance.toLocaleString()}
                </p>
              </div>
              {/* Placeholder for card image */}
              <div className="card-image-container">
                <img src={card.image} alt={`${card.name} card`} className="card-image" onError={(e) => e.currentTarget.style.display = 'none'}/>
              </div>
              <div className="card-actions">
                <button className="btn-card-action view-more" onClick={() => handleViewMore(card)}>
                  View More
                </button>
                <button
                  className="btn-card-action apply-now"
                  onClick={() => handleApply(card)}
                  disabled={loading}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
          currentBalance={userBalance}
        />
      )}
    </div>
  );
};

export default CardsPage;