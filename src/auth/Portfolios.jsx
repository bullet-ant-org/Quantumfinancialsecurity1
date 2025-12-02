import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Portfolios.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioCard = ({ user }) => {
  const portfolio = user.portfolio;
  const totalValue = portfolio?.totalValue ?? 0;

  const chartData = {
    labels: portfolio?.assets?.map(a => a.symbol) ?? [],
    datasets: [
      {
        data: portfolio?.assets?.map(a => a.value) ?? [],
        backgroundColor: [
          'rgba(0, 225, 255, 0.7)',
          'rgba(255, 183, 0, 0.7)',
          'rgba(255, 0, 55, 0.7)',
          'rgba(85, 0, 255, 0.7)',
          'rgba(40, 167, 69, 0.7)',
        ],
        borderColor: '#1f1f1f',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="portfolio-card">
      <div className="card-header">
        <h5 className="card-user-name">{user.username}</h5>
        <p className="card-user-email">{user.email}</p>
      </div>
      <div className="card-body">
        <div className="chart-container-small">
          {portfolio?.assets && portfolio.assets.length > 0 ? (
            <Doughnut data={chartData} options={chartOptions} />
          ) : (
            <div className="no-assets">No Assets</div>
          )}
        </div>
        <div className="portfolio-summary">
          <p className="total-value-label">Total Portfolio Value</p>
          <h3 className="total-value">${totalValue.toFixed(2)}</h3>
          <ul className="asset-list">
            {portfolio?.assets?.slice(0, 4).map(asset => (
              <li key={asset.symbol}>
                <span>{asset.name}</span>
                <span>${(asset.value || 0).toFixed(2)}</span>
              </li>
            ))}
            {portfolio?.assets && portfolio.assets.length > 4 && <li>...and more</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Portfolios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          // Use the error message from the backend if available
          throw new Error(data.message || 'Failed to fetch users and their portfolios.');
        }
        // The backend now returns users with their portfolios populated
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || 'Failed to load portfolio data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, [apiUrl, token]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (loading) return <div className="text-white text-center p-5">Loading Portfolios...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  return (
    <div className="portfolios-page">
      <h1 className="dashboard-title">User Portfolios</h1>
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
        {filteredUsers.map(user => (
          <PortfolioCard key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default Portfolios;