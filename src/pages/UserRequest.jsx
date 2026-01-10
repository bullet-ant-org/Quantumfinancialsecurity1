import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserRequest.css';

const ProgressBar = ({ step, totalSteps }) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const NoWalletConnected = () => (
  <div className="no-wallet-message-request">
    <span className="material-symbols-outlined">
      account_balance_wallet
    </span>
    <h2>No Wallet Connected</h2>
    <p>You need to connect a wallet to get your address for requests.</p>
    <Link to="/user/connect-wallet" className="btn-primary-gradient">
      Connect Wallet
    </Link>
  </div>
);

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
  const [recipient, setRecipient] = useState(''); // The user to request money from
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const totalSteps = 3;

  const nextStep = () => {
    if (step === 1 && !recipient.trim()) {
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
    if (step !== totalSteps) return; // Only submit on the final step

    setError('');
    setIsLoading(true);

    try {
      // This new endpoint will be handled by your notification controller
      const res = await fetch(`${apiUrl}/notifications/create-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientIdentifier: recipient, amount: parseFloat(amount) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send request notification.');
      }

      // Success, navigate away after a short delay
      setTimeout(() => {
        setIsLoading(false);
        navigate('/user/dashboard');
      }, 1500);

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
            <p>Enter their username or email address.</p>
            <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient's username or email" className="form-control-ticket" autoFocus />
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
            <p>A notification will be sent to the user.</p>
            <div className="review-details">
              <p><strong>Requesting from:</strong> {recipient}</p>
              <p><strong>Amount:</strong> ${parseFloat(amount || 0).toFixed(2)}</p>
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
        <div className="send-icon"><span className="material-symbols-outlined">call_received</span></div>
        <h1 className="ticket-title">Request Money</h1>
        <ProgressBar step={step} totalSteps={totalSteps} />
        <form onSubmit={handleSubmit} className="send-form">
          {error && <div className="ticket-error-message">{error}</div>}
          {renderStep()}
          <div className="navigation-buttons">
            {step > 1 && <button type="button" onClick={prevStep} className="btn-ticket-secondary">Back</button>}
            {step < totalSteps && <button type="button" onClick={nextStep} className="btn-ticket-primary">Continue</button>}
            {step === totalSteps && <button type="submit" className="btn-ticket-primary" disabled={isLoading}>{isLoading ? 'Sending Request...' : 'Confirm & Request'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRequest;