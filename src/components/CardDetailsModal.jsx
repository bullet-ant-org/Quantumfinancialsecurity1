import React from 'react';
import './CardDetailsModal.css';

const CardDetailsModal = ({ card, onClose, onApply }) => {
  if (!card) return null;

  return (
    <div className="card-modal-backdrop" onClick={onClose}>
      <div className="card-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="card-modal-header">
          <h2 className={`card-modal-title ${card.tier}`}>{card.name} Card</h2>
          <button onClick={onClose} className="card-modal-close-button">&times;</button>
        </div>
        <div className="card-modal-body">
          <p className="card-modal-description">{card.description}</p>
          <h4 className="card-modal-points-title">Key Benefits:</h4>
          <ul className="card-modal-points-list">
            {card.points.map((point, index) => (
              <li key={index}><span className="material-symbols-outlined">check_circle</span> {point}</li>
            ))}
          </ul>
        </div>
        <div className="card-modal-footer">
          <button className="btn-card-action apply-now" onClick={() => onApply(card)}>
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsModal;