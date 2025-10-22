import React from 'react';
import './InsufficientBalanceModal.css';

const InsufficientBalanceModal = ({ onClose, requiredBalance, currentBalance }) => {
  return (
    <div className="balance-modal-backdrop" onClick={onClose}>
      <div className="balance-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="balance-modal-header">
          <h2 className="balance-modal-title"><span className="material-symbols-outlined">warning</span> Insufficient Balance</h2>
          <button onClick={onClose} className="balance-modal-close-button">&times;</button>
        </div>
        <div className="balance-modal-body">
          <p>
            Your current balance of <strong>${currentBalance.toLocaleString()}</strong> does not meet the minimum requirement of <strong>${requiredBalance.toLocaleString()}</strong> to apply for this card.
          </p>
          <p>Please increase your portfolio value to be eligible.</p>
        </div>
        <div className="balance-modal-footer">
          <button className="btn-card-action ok-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsufficientBalanceModal;