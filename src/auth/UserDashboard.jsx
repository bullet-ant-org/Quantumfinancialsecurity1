import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import './UserDashboard.css';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import TradingViewWidget from '../components/TradingViewWidget';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [news, setNews] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (localUser) {
      setUser(localUser);
    }

    const fetchData = async () => {
      try {
        if (!localUser?.walletAddress) return setLoading(false);

        setLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };

        const [portfolioRes, transactionsRes, newsRes] = await Promise.all([
          fetch(`${apiUrl}/portfolio`, { headers }),
          fetch(`${apiUrl}/transactions`, { headers }),
          fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN'),
        ]);

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          // Correctly handle the new portfolio controller response structure
          if (portfolioData.isAdmin) {
            // Admin users don't have a personal portfolio on this dashboard.
            setPortfolio(null);
          } else {
            setPortfolio(portfolioData.portfolio);
          }
        } else {
          console.error('Failed to fetch portfolio data. Is a wallet connected?');
        }

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          const sortedTransactions = (transactionsData.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setTransactions(sortedTransactions.slice(0, 7));
        }

        if (newsRes.ok) {
          const newsData = await newsRes.json();
          setNews(newsData.Data.slice(0, 7));
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
    if (portfolio && portfolio.assets && portfolio.assets.length > 0) {
      const labels = portfolio.assets.map(asset => asset.symbol);
      const dataValues = portfolio.assets.map(asset => asset.value || 0);
      setChartData({
        labels,
        datasets: [{
          data: dataValues,
          backgroundColor: [
            '#00e1ff', '#ff4b8d', '#ffd700', '#4caf50', '#ff9800', '#9c27b0', '#3f51b5'
          ],
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
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          padding: 15,
          font: { size: 12 }
        }
      }
    },
    cutout: '70%',
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Asset Value Distribution',
        color: 'white',
        font: { size: 16 }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white'
        }
      },
      y: {
        ticks: { color: 'white' }
      }
    }
  };

  if (loading) return <div className="text-white text-center p-5">Loading Dashboard...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  // Check if user has connected wallet (verified status)
  const isVerified = user?.stellarAddress || user?.rippleAddress;

  return (
    <div className="user-dashboard animated">
      {/* User Details Section */}
      <div className="user-details-section">
        <div className="user-info-grid">
          <div className="user-info-item">
            <span className="info-label">Username:</span>
            <span className="info-value">{user?.username || 'N/A'}</span>
          </div>
          <div className="user-info-item">
            <span className="info-label">Full Name:</span>
            <span className="info-value">{user?.fullName || 'N/A'}</span>
          </div>
          <div className="user-info-item">
            <span className="info-label">Account Status:</span>
            <div className="status-indicator">
              <span className="status-text">{isVerified ? 'Verified' : 'Unverified'}</span>
              <div className={`status-circle ${isVerified ? 'verified' : 'unverified'}`}></div>
            </div>
          </div>
          <div className="user-info-item">
            <span className="info-label">Sign-up Date:</span>
            <span className="info-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Balances Section */}
      <div className="balances-section">
        <h3 className="section-title">Account Balances</h3>
        <div className="balances-grid">
          <div className="balance-card">
            <div className="balance-icon">
              <span className="material-symbols-outlined">currency_exchange</span>
            </div>
            <div className="balance-info">
              <span className="balance-symbol">XRP</span>
              <span className="balance-amount">
                {portfolio?.assets?.find(asset => asset.symbol === 'XRP')?.quantity?.toFixed(4) || '0.0000'}
              </span>
            </div>
          </div>
          <div className="balance-card">
            <div className="balance-icon">
              <span className="material-symbols-outlined">stars</span>
            </div>
            <div className="balance-info">
              <span className="balance-symbol">XLM</span>
              <span className="balance-amount">
                {portfolio?.assets?.find(asset => asset.symbol === 'XLM')?.quantity?.toFixed(4) || '0.0000'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rates Section */}
      <div className="rates-section">
        <h3 className="section-title">Market Rates</h3>
        <div className="rates-grid">
          <div className="rate-card">
            <div className="rate-header">
              <div className="rate-pair">
                <span className="material-symbols-outlined rate-icon">currency_exchange</span>
                <span className="rate-names">XRP/USDT</span>
              </div>
            </div>
            <div className="rate-value">
              <span className="current-rate">$0.50</span>
            </div>
          </div>
          <div className="rate-card">
            <div className="rate-header">
              <div className="rate-pair">
                <span className="material-symbols-outlined rate-icon">stars</span>
                <span className="rate-names">XLM/USDT</span>
              </div>
            </div>
            <div className="rate-value">
              <span className="current-rate">$0.10</span>
            </div>
          </div>
          <div className="rate-card">
            <div className="rate-header">
              <div className="rate-pair">
                <span className="material-symbols-outlined rate-icon">attach_money</span>
                <span className="rate-names">USDT/USD</span>
              </div>
            </div>
            <div className="rate-value">
              <span className="current-rate">$1.00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-lg-4">
          <div className="dashboard-card">
            <h5 className="card-title"><span className="material-symbols-outlined">pie_chart</span> Asset Allocation</h5>
            <div className="chart-wrapper">
              {chartData ? (
                <Doughnut data={chartData} options={doughnutOptions} />
              ) : (
                <div className="no-data-message">No assets to display.</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="dashboard-card">
            <div className="chart-wrapper" style={{ height: '350px' }}>
              {chartData ? (
                <Bar data={chartData} options={barOptions} />
              ) : (
                <div className="no-data-message">No assets to display.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-lg-12">
          <div className="dashboard-card h-100">
            <h5 className="card-title"><span className="material-symbols-outlined">trending_up</span> Market Overview</h5>
            <div className="tradingview-widget-wrapper">
              <TradingViewWidget />
            </div>
          </div>
        </div>
      </div>
      {/* Transactions and Activity Section */}
      <div className="activity-section">
        <div className="activity-header">
          <h4 className="activity-title">Recent Activity</h4>
        </div>
        <div className="activity-content">
          <div className="activity-item">
            <div className="activity-icon">
              <span className="material-symbols-outlined">swap_vert</span>
            </div>
            <div className="activity-details">
              <span className="activity-label">Recent Transactions</span>
              <span className="activity-count">{transactions.length} transactions</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <span className="material-symbols-outlined">confirmation_number</span>
            </div>
            <div className="activity-details">
              <span className="activity-label">Open Tickets</span>
              <span className="activity-count">0 tickets</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <span className="material-symbols-outlined">feed</span>
            </div>
            <div className="activity-details">
              <span className="activity-label">Latest News</span>
              <span className="activity-count">{news.length} articles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
