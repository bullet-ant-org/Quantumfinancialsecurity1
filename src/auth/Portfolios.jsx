import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Portfolios.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioDisplay = ({ portfolio, user }) => {
  const { assets = [], totalValue = 0 } = portfolio;

  const chartData = useMemo(() => ({
    labels: assets.map(a => a.symbol),
    datasets: [
      {
        data: assets.map(a => a.value),
        backgroundColor: [
          'rgba(0, 225, 255, 0.7)', // ETH color
          'rgba(255, 183, 0, 0.7)',
          'rgba(255, 0, 55, 0.7)',
          'rgba(85, 0, 255, 0.7)',
          'rgba(40, 167, 69, 0.7)',
        ],
        borderColor: '#1f1f1f',
        borderWidth: 2,
      },
    ],
  }), [assets]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="portfolio-card">
      {/* Display user info only if it's provided (for admin view) */}
      {user && (
        <div className="card-header">
          <h5 className="card-user-name">{user.username}</h5>
          <p className="card-user-email">{user.email}</p>
        </div>
      )}
      <div className="card-body">
        <div className={user ? "chart-container-small" : "chart-container"}>
          {assets.length > 0 ? (
            <Doughnut data={chartData} options={chartOptions} />
          ) : (
            <div className="no-assets">No Assets Found</div>
          )}
        </div>
        <div className="portfolio-summary">
          <p className="total-value-label">Total Portfolio Value</p>
          <h3 className="total-value">${totalValue.toFixed(2)}</h3>
          <ul className="asset-list">
            {assets.map(asset => (
              <li key={asset.symbol}>
                <span>{asset.name}</span>
                <span>${(asset.value || 0).toFixed(2)}</span>
              </li>
            ))}
            {assets.length === 0 && <li>Your tracked assets will appear here.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Portfolios = () => {
  const [data, setData] = useState({ isAdmin: false, portfolio: null, portfolios: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/portfolio`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.message || 'Failed to fetch portfolio data.');
        }
        setData(responseData);
      } catch (err) {
        setError(err.message || 'Failed to load portfolio data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, [apiUrl, token]);

  const filteredPortfolios = useMemo(() => {
    if (!data.isAdmin) return [];
    return data.portfolios.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (loading) return <div className="text-white text-center p-5">Loading Portfolios...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  // Admin View
  if (data.isAdmin) {
    return (
      <div className="portfolios-page">
        <h1 className="dashboard-title">All User Portfolios</h1>
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
          {filteredPortfolios.map(user => (
            <PortfolioDisplay key={user._id} user={user} portfolio={user.portfolio} />
          ))}
        </div>
      </div>
    );
  }

  // Regular User View
  return (
    <div className="portfolios-page">
      <h1 className="dashboard-title">My Portfolio</h1>
      {data.portfolio && <PortfolioDisplay portfolio={data.portfolio} />}
    </div>
  );
};

export default Portfolios;