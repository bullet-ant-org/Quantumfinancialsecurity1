import React, { useState } from 'react';
import './UserSend.css';


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
  const [recipient, setRecipient] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRecipientAddress('');
    setIsLoading(true);

    try {
      // This endpoint needs to be created on the backend.
      // It should find a user by email/username and return their public walletAddress.
      const res = await fetch(`${apiUrl}/users/find`, {
        method: 'POST', // Using POST to send recipient identifier in the body
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
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recipientAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  const handleReset = () => {
    setRecipient('');
    setRecipientAddress('');
    setError('');
  };

  const renderContent = () => {
    if (recipientAddress) {
      return (
        <div className="form-step active">
          <h2>Send to {recipient}</h2>
          <p>Copy the address below and use your wallet (e.g., MetaMask) to send funds.</p>
          <div className="wallet-address-display">
            <input type="text" value={recipientAddress} readOnly />
            <button type="button" onClick={handleCopy}>
              <span className="material-symbols-outlined">{isCopied ? 'done' : 'content_copy'}</span>
            </button>
          </div>
          <p className="on-chain-notice">This is an on-chain transaction. Your funds will be sent directly on the Ethereum network.</p>
          <button type="button" onClick={handleReset} className="btn-ticket-secondary mt-3">Send to someone else</button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="send-form">
        <div className="form-step active">
          <h2>Who are you sending to?</h2>
          <p>Enter the recipient's username or email to find their wallet address.</p>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient's username or email" className="form-control-ticket" autoFocus />
        </div>
        <div className="navigation-buttons">
          <button type="submit" className="btn-ticket-primary" disabled={isLoading || !recipient.trim()}>{isLoading ? 'Searching...' : 'Find Wallet Address'}</button>
        </div>
      </form>
    );
  };

  return (
    <div className="user-send-page">
      {isLoading && <LoadingSpinner />}
      <div className="ticket-form-container">
        <div className="send-icon"><span className="material-symbols-outlined">send</span></div>
        <h1 className="ticket-title">Send On-Chain</h1>
        {error && <div className="ticket-error-message">{error}</div>}
        {renderContent()}
      </div>
    </div>
  );
};

export default UserSend;