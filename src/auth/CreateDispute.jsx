import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateDispute.css';

const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="loading-spinner-large"></div>
    <p>Filing dispute...</p>
  </div>
);

const CreateDispute = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const [formData, setFormData] = useState({
    transactionId: '',
    title: '',
    category: 'payment',
    priority: 'medium',
    description: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.transactionId) {
      setFormData(prev => ({ ...prev, transactionId: location.state.transactionId }));
      setStep(2); // Skip to the next step since we have the ID
    }
  }, [location.state]);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && !formData.transactionId.trim()) {
      setError('Please provide the Transaction ID.');
      return;
    }
    if (step === 2 && !formData.title.trim()) {
      setError('Please provide a reason for the dispute.');
      return;
    }
    if (step === 4 && !formData.description.trim()) {
      setError('Please provide a detailed description.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create dispute.');
      setSuccess('Dispute filed successfully! Our dispute resolution team will review your case within 48 hours.');
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="dispute-step">
            <input
              type="text"
              name="transactionId"
              value={formData.transactionId}
              onChange={handleChange}
              placeholder="Transaction ID (e.g., TXN-123456789)"
              className="dispute-input"
              autoFocus
            />
            <div className="step-actions">
              <button type="button" onClick={nextStep} className="next-btn" disabled={!formData.transactionId.trim()}>
                Continue
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="dispute-step">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Dispute title (e.g., Incorrect amount charged)"
              className="dispute-input"
              autoFocus
            />
            <div className="step-actions">
              <button type="button" onClick={() => setStep(1)} className="back-btn">Back</button>
              <button type="button" onClick={nextStep} className="next-btn" disabled={!formData.title.trim()}>
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="dispute-step">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="dispute-input"
            >
              <option value="payment">Payment Issue</option>
              <option value="unauthorized">Unauthorized Transaction</option>
              <option value="incorrect_amount">Incorrect Amount</option>
              <option value="failed_transaction">Failed Transaction</option>
              <option value="refund">Refund Request</option>
              <option value="other">Other</option>
            </select>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="dispute-input"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="step-actions">
              <button type="button" onClick={() => setStep(2)} className="back-btn">Back</button>
              <button type="button" onClick={nextStep} className="next-btn">Continue</button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="dispute-step">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your dispute in detail..."
              className="dispute-input dispute-textarea"
              rows="4"
            />
            <div className="step-actions">
              <button type="button" onClick={() => setStep(3)} className="back-btn">Back</button>
              <button type="button" onClick={nextStep} className="next-btn" disabled={!formData.description.trim()}>
                Continue
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="dispute-step">
            <div className="dispute-summary">
              <div className="summary-row">
                <strong>Transaction:</strong> {formData.transactionId}
              </div>
              <div className="summary-row">
                <strong>Title:</strong> {formData.title}
              </div>
              <div className="summary-row">
                <strong>Category:</strong> {formData.category.replace('_', ' ')}
              </div>
              <div className="summary-row">
                <strong>Priority:</strong> {formData.priority}
              </div>
              <div className="summary-row">
                <strong>Description:</strong> {formData.description}
              </div>
            </div>
            <div className="dispute-notice">
              <span className="material-symbols-outlined">warning</span>
              <span>Disputes reviewed within 48 hours</span>
            </div>
            <div className="step-actions">
              <button type="button" onClick={() => setStep(4)} className="back-btn">Back</button>
              <button onClick={handleSubmit} className="submit-btn" disabled={loading}>
                {loading ? 'Filing...' : 'File Dispute'}
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="dispute-step success-step">
            <div className="success-animation">
              <div className="success-circle">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
            <h2 className="step-title">Dispute Filed!</h2>
            <p className="step-subtitle">{success}</p>
            <div className="step-actions">
              <button onClick={() => navigate('/user/dashboard')} className="primary-action-btn">
                Dashboard
              </button>
              <button onClick={() => navigate('/user/disputes')} className="secondary-action-btn">
                View Disputes
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-dispute-page">
      {/* Hero Section */}
      <div className="dispute-hero-section">
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <span className="material-symbols-outlined hero-icon">gavel</span>
          </div>
          <h1 className="hero-title">File a Dispute</h1>
          <p className="hero-subtitle">
            Need to dispute a transaction? Our dispute resolution team will help resolve your issue fairly and efficiently.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dispute-container">
        {/* Status Messages */}
        {error && (
          <div className="status-message error-message">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="dispute-progress">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div key={stepNum} className={`progress-step ${step >= stepNum ? 'active' : ''}`}>
              <div className="step-circle">{stepNum}</div>
              <span className="step-label">
                {stepNum === 1 ? 'Transaction' : stepNum === 2 ? 'Reason' : stepNum === 3 ? 'Category' : stepNum === 4 ? 'Details' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        {/* Dispute Form Card */}
        <div className="dispute-card">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="dispute-footer">
          <p>Need help? Contact our dispute team at <a href="mailto:disputes@qfs.com">disputes@qfs.com</a></p>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && <LoadingSpinner />}
    </div>
  );
};

export default CreateDispute;
