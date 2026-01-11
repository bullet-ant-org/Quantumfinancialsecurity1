import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTicket.css';

const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="loading-spinner-large"></div>
    <p>Submitting ticket...</p>
  </div>
);

const CreateTicket = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    priority: 'medium',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && !formData.title.trim()) {
      setError('Please provide a title for your ticket.');
      return;
    }
    if (step === 3 && !formData.description.trim()) {
      setError('Please provide a description.');
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
      const res = await fetch(`${apiUrl}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create ticket.');
      setSuccess('Ticket submitted successfully! Our support team will respond within 24 hours.');
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
          <div className="ticket-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <h2 className="step-title">What is the issue about?</h2>
              <p className="step-subtitle">Provide a concise title for your support ticket.</p>
            </div>
            <div className="input-group">
             
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., 'Transaction failed' or 'Wallet connection issue'"
                className="ticket-input"
                autoFocus
              />
            </div>
            <div className="step-actions">
              <button type="button" onClick={nextStep} className="next-btn" disabled={!formData.title.trim()}>
                <span className="material-symbols-outlined">arrow_forward</span>
                Continue
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="ticket-step">
            <div className="step-header">
              <span className="step-number">2</span>
              <h2 className="step-title">Categorize your issue</h2>
              <p className="step-subtitle">This helps us route your ticket to the right team.</p>
            </div>
            <div className="input-group">
              
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="ticket-input"
              >
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="security">Security Concern</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
            <div className="input-group">
              
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="ticket-input"
              >
                <option value="low">Low - General question</option>
                <option value="medium">Medium - Issue affecting usage</option>
                <option value="high">High - Critical problem</option>
              </select>
            </div>
            <div className="step-actions">
              <button type="button" onClick={() => setStep(1)} className="back-btn">
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              <button type="button" onClick={nextStep} className="next-btn">
                <span className="material-symbols-outlined">arrow_forward</span>
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="ticket-step">
            <div className="step-header">
              <span className="step-number">3</span>
              <h2 className="step-title">Describe your issue in detail</h2>
              <p className="step-subtitle">The more details you provide, the faster we can help.</p>
            </div>
            <div className="input-group">
              
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please include any relevant details, transaction IDs, error messages, or steps to reproduce the issue..."
                className="ticket-input ticket-textarea"
                rows="6"
              />
            </div>
            <div className="step-actions">
              <button type="button" onClick={() => setStep(2)} className="back-btn">
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              <button type="button" onClick={nextStep} className="next-btn" disabled={!formData.description.trim()}>
                <span className="material-symbols-outlined">arrow_forward</span>
                Continue
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="ticket-step">
            <div className="step-header">
              <span className="step-number">4</span>
              <h2 className="step-title">Review your ticket</h2>
              <p className="step-subtitle">Please review the details before submitting.</p>
            </div>
            <div className="ticket-summary">
              <div className="summary-item">
                <span className="summary-label">Title</span>
                <span className="summary-value">{formData.title}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Category</span>
                <span className="summary-value">
                  {formData.category === 'general' && 'General Inquiry'}
                  {formData.category === 'technical' && 'Technical Issue'}
                  {formData.category === 'billing' && 'Billing Question'}
                  {formData.category === 'security' && 'Security Concern'}
                  {formData.category === 'feedback' && 'Feedback'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Priority</span>
                <span className="summary-value priority-badge" data-priority={formData.priority}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </span>
              </div>
              <div className="summary-item description-item">
                <span className="summary-label">Description</span>
                <span className="summary-value">{formData.description}</span>
              </div>
            </div>
            <div className="ticket-notice">
              <span className="material-symbols-outlined">info</span>
              <span>Our support team typically responds within 24 hours. You'll receive an email notification when your ticket is updated.</span>
            </div>
            <div className="step-actions">
              <button type="button" onClick={() => setStep(3)} className="back-btn">
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              <button onClick={handleSubmit} className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="ticket-step success-step">
            <div className="success-animation">
              <div className="success-circle">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
            <h2 className="step-title">Ticket Submitted Successfully!</h2>
            <p className="step-subtitle">{success}</p>
            <div className="step-actions">
              <button onClick={() => navigate('/user/dashboard')} className="primary-action-btn">
                <span className="material-symbols-outlined">dashboard</span>
                Go to Dashboard
              </button>
              <button onClick={() => navigate('/user/tickets')} className="secondary-action-btn">
                <span className="material-symbols-outlined">confirmation_number</span>
                View My Tickets
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-ticket-page">
      {/* Hero Section */}
      <div className="ticket-hero-section">
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <span className="material-symbols-outlined hero-icon">support</span>
          </div>
          <h1 className="hero-title">Get Support</h1>
          <p className="hero-subtitle">
            Need help? Submit a support ticket and our team will assist you promptly.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="ticket-container">
        {/* Status Messages */}
        {error && (
          <div className="status-message error-message">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="ticket-progress">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className={`progress-step ${step >= stepNum ? 'active' : ''}`}>
              <div className="step-circle">{stepNum}</div>
              <span className="step-label">
                {stepNum === 1 ? 'Title' : stepNum === 2 ? 'Category' : stepNum === 3 ? 'Details' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        {/* Ticket Form Card */}
        <div className="ticket-card">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="ticket-footer">
          <p>Need immediate assistance? Contact us at <a href="mailto:support@qfs.com">support@qfs.com</a></p>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && <LoadingSpinner />}
    </div>
  );
};

export default CreateTicket;
