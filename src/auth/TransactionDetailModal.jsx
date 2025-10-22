import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TransactionDetailModal.css';

const TransactionDetailModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const navigate = useNavigate();
  const getStatusClass = (status) => `status-${status.toLowerCase()}`;
  const getAmountClass = (type) => (type === 'credit' ? 'credit' : 'debit');

  const handleDispute = () => {
    onClose(); // Close the modal first
    navigate('/user/create-dispute', { state: { transactionId: transaction._id } });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Transaction Details</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Transaction ID</span>
            <span className="detail-value tx-id">{transaction._id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">{new Date(transaction.createdAt).toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Type</span>
            <span className={`detail-value type ${getAmountClass(transaction.type)}`}>{transaction.type}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount</span>
            <span className={`detail-value amount ${getAmountClass(transaction.type)}`}>
              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className={`detail-value status-badge ${getStatusClass(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
          <div className="detail-row description-row">
            <span className="detail-label">Description</span>
            <p className="detail-value description">{transaction.description || 'No description provided.'}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={handleDispute} className="btn-dispute">
            <i className="bi bi-shield-exclamation"></i>
            Dispute this Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;