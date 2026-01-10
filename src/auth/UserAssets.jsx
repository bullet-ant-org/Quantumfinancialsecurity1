import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import './UserAssets.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const NoWalletConnected = () => (
  <div className="no-wallet-message">
    <span className="material-symbols-outlined">
      account_balance_wallet
    </span>
    <h2>No Wallet Connected</h2>
    <p>Please connect your wallet to view your assets.</p>
    <Link to="/user/connect-wallet" className="btn-primary-gradient">
      Connect Wallet
    </Link>
  </div>
);

const UserAssets = () => {
  const [portfolio, setPortfolio] = useState({ assets: [], totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [user, setUser] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));

    if (localUser) {
      setUser(localUser);
    }

    const fetchData = async () => {
      if (!localUser?.stellarAddress && !localUser?.rippleAddress) {
        setLoading(false);
        // No need to set an error, the UI will show the "Connect Wallet" prompt
        return;
      }


      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/portfolio`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch portfolio data.');
        const portfolioData = await res.json();
        setPortfolio(portfolioData);
      } catch (err) {
        // Don't set an error, just means no wallet is connected.
        // The UI will handle showing the prompt.
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token, user?.walletAddress]);

  useEffect(() => {
    if (portfolio && portfolio.assets && portfolio.assets.length > 0) {
      const labels = portfolio.assets.map(asset => asset.symbol);
      const data = portfolio.assets.map(asset => asset.value || 0);
      const backgroundColors = [
        '#00e1ff', '#ff4b8d', '#ffd700', '#4caf50', '#ff9800', '#9c27b0', '#3f51b5'
      ];

      setChartData({
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors,
          borderColor: '#1a1a1a',
          borderWidth: 2,
        }]
      });
    }
  }, [portfolio]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: 'white', padding: 15, font: { size: 14 } } },
    },
    cutout: '70%',
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: 'white', font: { size: 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: 'white', font: { size: 12 } },
        grid: { display: false },
      },
    },
  };

  if (loading) return <div className="text-white text-center p-5">Loading Portfolio...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;
  return (
    <div className="user-assets-page">
      <h1 className="dashboard-title">My Portfolio</h1>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="dashboard-card">
            <h5 className="card-title">Asset Allocation</h5>
            <div className="chart-wrapper">
              {chartData ? (
                <Doughnut data={chartData} options={doughnutOptions} />
              ) : (
                <div className="no-data-message">No assets to display.</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="dashboard-card">
            <h5 className="card-title">Asset Values</h5>
            <div className="chart-wrapper">
              {chartData ? (
                <Bar data={chartData} options={barOptions} />
              ) : (
                <div className="no-data-message">No assets to display.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card mt-4">
        <h5 className="card-title">All Assets</h5>
        <div className="asset-list-container">
          <ul className="asset-list">
            {portfolio?.assets && portfolio.assets.length > 0 ? (
              portfolio.assets.map((asset, index) => (
                <li key={asset.name} className="asset-item">
                  <div className="asset-info">
                    <span className="asset-name">{asset.name} ({asset.symbol.replace('_TRC20', '')})</span>
                    <span className="asset-quantity">{parseFloat(asset.quantity).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
                  </div>
                  <div className="asset-value">
                    ${(asset.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </li>
              ))
            ) : (
              <div className="no-wallet-message">
                <span className="material-symbols-outlined">
                  account_balance_wallet
                </span>
                <h2>No Wallet Connected</h2>
                <p>Please connect your wallet to view your assets.</p>
                <Link to="/user/connect-wallet" className="btn-primary-gradient">
                  Connect Wallet
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserAssets;
