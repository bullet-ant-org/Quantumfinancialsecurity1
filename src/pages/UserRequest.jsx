import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserRequest.css';

const ProgressBar = ({ step, totalSteps }) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="spinner">
      <div className="double-bounce1"></div>
      <div className="double-bounce2"></div>
    </div>
    <p>Sending request...</p>
  </div>
);

const UserRequest = () => {
  const [step, setStep] = useState(1);
  const [sender, setSender] = useState(''); // The user to request money from
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const totalSteps = 3;

  const nextStep = () => {
    if (step === 1 && !sender.trim()) {
      setError('Please enter a username or email to request from.');
      return;
    }
    if (step === 2) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid, positive amount.');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Placeholder for the backend request money endpoint
      const res = await fetch(`${apiUrl}/transactions/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sender, amount: parseFloat(amount) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to request money.');
      }

      setTimeout(() => {
        setIsLoading(false);
        navigate('/user/dashboard'); // Or a confirmation page
      }, 2000);

    } catch (err) {
      setIsLoading(false);
      setError(err.message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step active">
            <h2>Who are you requesting money from?</h2>
            <p>Enter the sender's username or email address.</p>
            <input type="text" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Sender's username or email" className="form-control-ticket" autoFocus />
          </div>
        );
      case 2:
        return (
          <div className="form-step active">
            <h2>How much do you want to request?</h2>
            <p>Enter the amount in USD.</p>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="form-control-ticket amount-input" autoFocus />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-step active">
            <h2>Review and Request</h2>
            <p>Please confirm the details before sending the request.</p>
            <div className="review-details">
              <p><strong>Requesting from:</strong> {sender}</p>
              <p><strong>Amount:</strong> ${parseFloat(amount).toFixed(2)}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-send-page">
      {isLoading && <LoadingSpinner />}
      <div className="ticket-form-container">
        <div className="send-icon"><span className="material-symbols-outlined">
          call_received
          </span></div>
        <h1 className="ticket-title">Request Money</h1>
        <ProgressBar step={step} totalSteps={totalSteps} />
        <form onSubmit={handleSubmit} className="send-form">
          {error && <div className="ticket-error-message">{error}</div>}
          {renderStep()}
          <div className="navigation-buttons">
            {step > 1 && <button type="button" onClick={prevStep} className="btn-ticket-secondary">Back</button>}
            {step < totalSteps && <button type="button" onClick={nextStep} className="btn-ticket-primary">Continue</button>}
            {step === totalSteps && <button type="submit" className="btn-ticket-primary" disabled={isLoading}>{isLoading ? 'Sending...' : 'Confirm & Request'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRequest;