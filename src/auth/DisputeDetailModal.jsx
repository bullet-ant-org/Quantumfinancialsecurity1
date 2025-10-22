import React from 'react';
import './TransactionDetailModal.css'; // Reusing styles for consistency

const DisputeDetailModal = ({ dispute, onClose }) => {
  if (!dispute) return null;

  const getStatusClass = (status) => `status-${status.toLowerCase().replace(/_/g, '-')}`;
  const getPriorityClass = (priority) => {
    if (priority === 'high') return 'priority-high';
    if (priority === 'medium') return 'priority-medium';
    return 'priority-low';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dispute Details</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Dispute ID</span>
            <span className="detail-value tx-id">{dispute._id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Transaction ID</span>
            <span className="detail-value tx-id">{dispute.transaction?._id || dispute.transaction}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date Submitted</span>
            <span className="detail-value">{new Date(dispute.createdAt).toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Priority</span>
            <span className={`detail-value status-badge ${getPriorityClass(dispute.priority)}`}>
              {dispute.priority}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className={`detail-value status-badge ${getStatusClass(dispute.status)}`}>
              {dispute.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="detail-row description-row">
            <span className="detail-label">Reason</span>
            <p className="detail-value description">{dispute.title}</p>
          </div>
          <div className="detail-row description-row">
            <span className="detail-label">Description</span>
            <p className="detail-value description">{dispute.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetailModal;