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
import XRPLogo from '../assets/xrplogo.png';
import XLMLogo from '../assets/xlmlogo.png';
import USDTLogo from '../assets/usdtlogo.png';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const NoWalletConnected = () => (
  <div className="assets-empty-state">
    <div className="empty-state-icon">
      <span className="material-symbols-outlined">account_balance_wallet</span>
    </div>
    <h2 className="empty-state-title">No Wallet Connected</h2>
    <p className="empty-state-subtitle">Connect your Stellar and Ripple wallets to view your crypto assets</p>
    <Link to="/user/connect-wallet" className="connect-wallet-btn">
      <span className="material-symbols-outlined">link</span>
      Connect Wallet
    </Link>
  </div>
);

const AdminPlaceholder = () => (
  <div className="assets-empty-state">
    <div className="empty-state-icon">
      <span className="material-symbols-outlined">admin_panel_settings</span>
    </div>
    <h2 className="empty-state-title">Admin Dashboard</h2>
    <p className="empty-state-subtitle">Access administrative controls and manage user portfolios</p>
    <Link to="/portfolios" className="connect-wallet-btn">
      <span className="material-symbols-outlined">group</span>
      View All Portfolios
    </Link>
  </div>
);

const AssetCard = ({ asset, logo }) => (
  <div className="asset-card">
    <div className="asset-header">
      <div className="asset-logo">
        <img src={logo} alt={asset.symbol} />
      </div>
      <div className="asset-info">
        <h3 className="asset-name">{asset.name}</h3>
        <span className="asset-symbol">{asset.symbol}</span>
      </div>
    </div>
    <div className="asset-details">
      <div className="asset-quantity">
        <span className="quantity-label">Balance</span>
        <span className="quantity-value">{parseFloat(asset.quantity).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
      </div>
      <div className="asset-value">
        <span className="value-label">Value</span>
        <span className="value-amount">${(asset.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    </div>
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

  // Get logo for asset
  const getAssetLogo = (symbol) => {
    switch (symbol) {
      case 'XRP': return XRPLogo;
      case 'XLM': return XLMLogo;
      case 'USDT': return USDTLogo;
      default: return XRPLogo; // fallback
    }
  };

  if (loading) {
    return (
      <div className="user-assets-page">
        <div className="assets-loading">
          <div className="loading-spinner-large"></div>
          <h3>Loading Your Portfolio...</h3>
          <p>Fetching your crypto assets</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-assets-page">
        <div className="assets-error">
          <span className="material-symbols-outlined">error</span>
          <h3>Failed to Load Portfolio</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isWalletConnected) return <NoWalletConnected />;
  if (isWalletConnected && !portfolio) return <AdminPlaceholder />;

  const totalValue = portfolio?.assets?.reduce((sum, asset) => sum + (asset.value || 0), 0) || 0;

  return (
    <div className="user-assets-page">
      {/* Portfolio Overview Header */}
      <div className="portfolio-header">
        <div className="portfolio-summary">
          <h1 className="portfolio-title">My Portfolio</h1>
          <div className="portfolio-stats">
            <div className="stat-item">
              <span className="stat-label">Total Value</span>
              <span className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Assets</span>
              <span className="stat-value">{portfolio?.assets?.length || 0}</span>
            </div>
          </div>
        </div>
        <div className="wallet-status">
          <div className="status-indicator connected">
            <span className="material-symbols-outlined">check_circle</span>
            <span>Wallet Connected</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="assets-grid">
        {/* Chart Section */}
        <div className="chart-section">
          <div className="assets-card">
            <div className="card-header">
              <h3 className="card-title">Asset Distribution</h3>
            </div>
            <div className="chart-container">
              {chartData && portfolio?.assets?.length > 0 ? (
                <Doughnut data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'var(--text-primary)',
                        padding: 15,
                        font: { size: 12 }
                      }
                    }
                  },
                  cutout: '70%',
                }} />
              ) : (
                <div className="chart-placeholder">
                  <span className="material-symbols-outlined">pie_chart</span>
                  <p>No assets to display</p>
                  <small>Add crypto to your wallet to see the distribution</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assets List Section */}
        <div className="assets-list-section">
          <div className="assets-card">
            <div className="card-header">
              <h3 className="card-title">Your Assets</h3>
            </div>
            <div className="assets-list">
              {portfolio?.assets?.length > 0 ? (
                portfolio.assets.map((asset) => (
                  <AssetCard
                    key={asset.symbol}
                    asset={asset}
                    logo={getAssetLogo(asset.symbol)}
                  />
                ))
              ) : (
                <div className="empty-assets">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  <h4>No Assets Found</h4>
                  <p>Your connected wallets don't contain any supported cryptocurrencies yet.</p>
                  <small>Supported: XRP, XLM, USDT</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAssets;
