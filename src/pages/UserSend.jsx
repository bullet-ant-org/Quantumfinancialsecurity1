import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './UserSend.css';
import XRPLogo from '../assets/xrplogo.png';
import XLMLogo from '../assets/xlmlogo.png';
import USDTLogo from '../assets/usdtlogo.png';

const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="loading-spinner-large"></div>
    <p>Processing transaction...</p>
  </div>
);

const CryptoSelector = ({ selectedCrypto, onCryptoChange }) => (
  <div className="crypto-selector">
    <h3 className="selector-title">Select Cryptocurrency</h3>
    <div className="crypto-options">
      {[
        { symbol: 'XRP', name: 'Ripple', logo: XRPLogo },
        { symbol: 'XLM', name: 'Stellar', logo: XLMLogo },
        { symbol: 'USDT', name: 'Tether', logo: USDTLogo }
      ].map((crypto) => (
        <button
          key={crypto.symbol}
          type="button"
          className={`crypto-option ${selectedCrypto === crypto.symbol ? 'active' : ''}`}
          onClick={() => onCryptoChange(crypto.symbol)}
        >
          <img src={crypto.logo} alt={crypto.symbol} className="crypto-logo-small" />
          <div className="crypto-info">
            <span className="crypto-symbol">{crypto.symbol}</span>
            <span className="crypto-name">{crypto.name}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);



const UserSend = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('XRP');
  const [recipient, setRecipient] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [step, setStep] = useState(1); // 1: crypto selection, 2: recipient, 3: amount, 4: confirm

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    setStep(2);
  };

  const handleFindRecipient = async (e) => {
    e.preventDefault();
    setError('');
    setRecipientAddress('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/users/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ identifier: recipient }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Could not find user.');
      }

      if (!data.walletAddress) {
        throw new Error('This user has not connected a wallet address yet.');
      }

      setRecipientAddress(data.walletAddress);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setStep(4);
  };

  const handleSend = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // This would be the actual send transaction endpoint
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(`Successfully sent ${amount} ${selectedCrypto} to ${recipient}!`);
      setStep(5);
    } catch (err) {
      setError('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recipientAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetForm = () => {
    setSelectedCrypto('XRP');
    setRecipient('');
    setRecipientAddress('');
    setAmount('');
    setError('');
    setSuccess('');
    setStep(1);
  };

  const getCryptoLogo = (symbol) => {
    switch (symbol) {
      case 'XRP': return XRPLogo;
      case 'XLM': return XLMLogo;
      case 'USDT': return USDTLogo;
      default: return XRPLogo;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="send-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <h2 className="step-title">Choose Cryptocurrency</h2>
              <p className="step-subtitle">Select the cryptocurrency you want to send</p>
            </div>
            <CryptoSelector selectedCrypto={selectedCrypto} onCryptoChange={handleCryptoSelect} />
          </div>
        );

      case 2:
        return (
          <div className="send-step">
            <div className="step-header">
              <span className="step-number">2</span>
              <h2 className="step-title">Find Recipient</h2>
              <p className="step-subtitle">Enter the recipient's username or email</p>
            </div>
            <form onSubmit={handleFindRecipient} className="recipient-form">
              <div className="input-group">
                
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Username or email address"
                  className="recipient-input"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="step-actions">
                <button type="button" onClick={() => setStep(1)} className="back-btn">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </button>
                <button type="submit" className="next-btn" disabled={isLoading || !recipient.trim()}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Finding...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">search</span>
                      Find User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 3:
        return (
          <div className="send-step">
            <div className="step-header">
              <span className="step-number">3</span>
              <h2 className="step-title">Enter Amount</h2>
              <p className="step-subtitle">How much {selectedCrypto} do you want to send?</p>
            </div>
            <div className="recipient-info">
              <div className="recipient-display">
                <span className="material-symbols-outlined">person</span>
                <span>Sending to: {recipient}</span>
              </div>
              <div className="address-display">
                <span className="address-label">Wallet Address:</span>
                <div className="address-copy">
                  <span className="address-text">{recipientAddress.slice(0, 12)}...{recipientAddress.slice(-8)}</span>
                  <button onClick={handleCopy} className="copy-btn">
                    <span className="material-symbols-outlined">
                      {isCopied ? 'done' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <form onSubmit={handleAmountSubmit} className="amount-form">
              <div className="amount-input-group">
                <div className="crypto-display">
                  <img src={getCryptoLogo(selectedCrypto)} alt={selectedCrypto} className="crypto-logo-tiny" />
                  <span className="crypto-symbol">{selectedCrypto}</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="amount-input"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="step-actions">
                <button type="button" onClick={() => setStep(2)} className="back-btn">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </button>
                <button type="submit" className="next-btn" disabled={!amount || parseFloat(amount) <= 0}>
                  <span className="material-symbols-outlined">arrow_forward</span>
                  Continue
                </button>
              </div>
            </form>
          </div>
        );

      case 4:
        return (
          <div className="send-step">
            <div className="step-header">
              <span className="step-number">4</span>
              <h2 className="step-title">Confirm Transaction</h2>
              <p className="step-subtitle">Review the details before sending</p>
            </div>
            <div className="transaction-summary">
              <div className="summary-item">
                <span className="summary-label">Sending</span>
                <div className="summary-value">
                  <img src={getCryptoLogo(selectedCrypto)} alt={selectedCrypto} className="crypto-logo-tiny" />
                  <span>{amount} {selectedCrypto}</span>
                </div>
              </div>
              <div className="summary-item">
                <span className="summary-label">To</span>
                <span className="summary-value">{recipient}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Network</span>
                <span className="summary-value">
                  {selectedCrypto === 'XRP' ? 'Ripple' : selectedCrypto === 'XLM' ? 'Stellar' : 'Multi-chain'}
                </span>
              </div>
            </div>
            <div className="transaction-notice">
              <span className="material-symbols-outlined">info</span>
              <span>This is an on-chain transaction. Network fees may apply.</span>
            </div>
            <div className="step-actions">
              <button type="button" onClick={() => setStep(3)} className="back-btn">
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
              <button onClick={handleSend} className="send-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Send {selectedCrypto}
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="send-step success-step">
            <div className="success-animation">
              <div className="success-circle">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
            <h2 className="step-title">Transaction Successful!</h2>
            <p className="step-subtitle">{success}</p>
            <div className="step-actions">
              <button onClick={resetForm} className="primary-action-btn">
                <span className="material-symbols-outlined">add</span>
                Send Another
              </button>
              <Link to="/user/dashboard" className="secondary-action-btn">
                <span className="material-symbols-outlined">dashboard</span>
                Go to Dashboard
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="user-send-page">
      {/* Hero Section */}
      <div className="send-hero-section">
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <span className="material-symbols-outlined hero-icon">send</span>
          </div>
          <h1 className="hero-title">Send Cryptocurrency</h1>
          <p className="hero-subtitle">
            Send XRP, XLM, or USDT securely to other users on our platform
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="send-container">
        {/* Status Messages */}
        {error && (
          <div className="status-message error-message">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="send-progress">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className={`progress-step ${step >= stepNum ? 'active' : ''}`}>
              <div className="step-circle">{stepNum}</div>
              <span className="step-label">
                {stepNum === 1 ? 'Crypto' : stepNum === 2 ? 'Recipient' : stepNum === 3 ? 'Amount' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>

        {/* Send Form Card */}
        <div className="send-card">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="send-footer">
          <Link to="/user/dashboard" className="back-link">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default UserSend;
