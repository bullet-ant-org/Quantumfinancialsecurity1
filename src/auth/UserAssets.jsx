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

const AdminPlaceholder = () => (
  <div className="no-wallet-message">
    <span className="material-symbols-outlined">
      admin_panel_settings
    </span>
    <h2>Admin View</h2>
    <p>This is your personal asset dashboard. As an admin, you can view all user portfolios.</p>
    <Link to="/portfolios" className="btn-primary-gradient">
      View All Portfolios
    </Link>
  </div>
);
const UserAssets = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
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
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/portfolio`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const portfolioData = await res.json();
        if (!res.ok) {
          // A 404 from our backend means no wallet is linked. Other errors are treated as errors.
          if (res.status !== 404) throw new Error(portfolioData.message || 'Failed to fetch portfolio data.');
          setIsWalletConnected(false);
        } else {
          // Handle admin user case
          if (portfolioData.isAdmin) {
            setPortfolio(null); // Admins don't have a personal portfolio on this page
          } else {
            setPortfolio(portfolioData.portfolio); // Extract the nested portfolio object for a regular user
          }
          setIsWalletConnected(true); // Wallet is considered "connected" if the user exists
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token, user?.walletAddress]);

  useEffect(() => {
    if (isWalletConnected && portfolio?.assets?.length > 0) {
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
  }, [portfolio, isWalletConnected]);

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
  if (!isWalletConnected) return <NoWalletConnected />;

  // If the user is an admin, they don't have a personal portfolio on this page.
  // The `portfolio` state will be null in this case.
  if (isWalletConnected && !portfolio) return <AdminPlaceholder />;

  return (
    <div className="user-assets-page">
      <div className="d-flex align-items-center mb-4">
        <h1 className="dashboard-title mb-0">My Portfolio</h1>
        <div
          className={`wallet-status-indicator ms-3 ${isWalletConnected ? 'connected' : 'disconnected'}`}
          title={isWalletConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
        ></div>
      </div>

      {/* Main content is only shown if a wallet is connected */}
      {isWalletConnected && (
      <>
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="dashboard-card">
            <h5 className="card-title">Asset Allocation</h5>
            <div className="chart-wrapper">
              {chartData ? (
                <Doughnut data={chartData} options={doughnutOptions} />
              ) : portfolio?.assets?.length === 0 ? (
                <div className="no-data-message">Portfolio Balance: $0.00<br/><small>Add coins to your wallet to see them here.</small></div>
              )
              : (
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
              ) : portfolio?.assets?.length === 0 ? (
                <div className="no-data-message">Your asset values will be shown here.</div>
              )
              : (
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
            {portfolio?.assets?.length > 0 ? (
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
              <div className="no-data-message text-center p-4">
                <h4>Portfolio Balance: $0.00</h4>
                <p className="mb-0">Once you add ETH or other assets to your connected wallet, they will appear here automatically.</p>
              </div>
            )}
          </ul>
        </div>
      </div>
      </>)}
    </div>
  );
};

export default UserAssets;
