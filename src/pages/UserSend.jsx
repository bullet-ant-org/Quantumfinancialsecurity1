import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserSend.css';

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
    <p>Processing transaction...</p>
  </div>
);

const UserSend = () => {
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const totalSteps = 3;

  const nextStep = () => {
    if (step === 1 && !recipient.trim()) {
      setError('Please enter a recipient username or email.');
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
      const res = await fetch(`${apiUrl}/transactions/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipient, amount: parseFloat(amount) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send money.');
      }

      setTimeout(() => {
        setIsLoading(false);
        navigate('/user/dashboard');
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
            <h2>Who are you sending money to?</h2>
            <p>Enter the recipient's username or email address.</p>
            <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient's username or email" className="form-control-ticket" autoFocus />
          </div>
        );
      case 2:
        return (
          <div className="form-step active">
            <h2>How much do you want to send?</h2>
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
            <h2>Review and Send</h2>
            <p>Please confirm the details before sending.</p>
            <div className="review-details">
              <p><strong>Sending to:</strong> {recipient}</p>
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
          send
          </span></div>
        <h1 className="ticket-title">Send Money</h1>
        <ProgressBar step={step} totalSteps={totalSteps} />
        <form onSubmit={handleSubmit} className="send-form">
          {error && <div className="ticket-error-message">{error}</div>}
          {renderStep()}
          <div className="navigation-buttons">
            {step > 1 && <button type="button" onClick={prevStep} className="btn-ticket-secondary">Back</button>}
            {step < totalSteps && <button type="button" onClick={nextStep} className="btn-ticket-primary">Continue</button>}
            {step === totalSteps && <button type="submit" className="btn-ticket-primary" disabled={isLoading}>{isLoading ? 'Sending...' : 'Confirm & Send'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSend;