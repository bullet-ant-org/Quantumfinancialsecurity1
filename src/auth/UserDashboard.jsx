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
import useMarketData from '../hooks/useMarketData';
import XRPLogo from '../assets/xrplogo.png';
import XLMLogo from '../assets/xlmlogo.png';
import USDTLogo from '../assets/usdtlogo.png';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [news, setNews] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the market data hook
  const { marketData, loading: marketLoading } = useMarketData();

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
        const headers = { 'Authorization': `Bearer ${token}` };

        // Always try to fetch portfolio data - the backend will handle wallet connection checks
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
          const errorData = await portfolioRes.json().catch(() => ({}));
          console.error('Failed to fetch portfolio data:', errorData?.message || 'Unknown error');
          setPortfolio(null);
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
  }, [apiUrl, token]);

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
              <img src={XRPLogo} alt="XRP" className="crypto-logo" />
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
              <img src={XLMLogo} alt="XLM" className="crypto-logo" />
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
                <img src={XRPLogo} alt="XRP" className="rate-icon crypto-logo-small" />
                <span className="rate-names">XRP/USDT</span>
              </div>
            </div>
            <div className="rate-value">
              <span className={`rate-trend ${marketData.XRP.change24h >= 0 ? 'up' : marketData.XRP.change24h < 0 ? 'down' : 'neutral'}`}>
                <span className="material-symbols-outlined">
                  {marketData.XRP.change24h > 0 ? 'trending_up' : marketData.XRP.change24h < 0 ? 'trending_down' : 'trending_flat'}
                </span>
              </span>
              <span className="current-rate">
                {marketLoading ? '...' : `$${marketData.XRP.price.toFixed(4)}`}
              </span>

              <div className="rate-change">
                <span className={`change-percent ${marketData.XRP.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {marketData.XRP.change24h >= 0 ? '+' : ''}{marketData.XRP.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="rate-card">
            <div className="rate-header">
              <div className="rate-pair">
                <img src={XLMLogo} alt="XLM" className="rate-icon crypto-logo-small" />
                <span className="rate-names">XLM/USDT</span>
              </div>
            </div>
            <div className="rate-value">
               <span className={`rate-trend ${marketData.XLM.change24h >= 0 ? 'up' : marketData.XLM.change24h < 0 ? 'down' : 'neutral'}`}>
                <span className="material-symbols-outlined">
                  {marketData.XLM.change24h > 0 ? 'trending_up' : marketData.XLM.change24h < 0 ? 'trending_down' : 'trending_flat'}
                </span>
              </span>
              <span className="current-rate">

                {marketLoading ? '...' : `$${marketData.XLM.price.toFixed(4)}`}
              </span>

              <div className="rate-change">
                <span className={`change-percent ${marketData.XLM.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {marketData.XLM.change24h >= 0 ? '+' : ''}{marketData.XLM.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="rate-card">
            <div className="rate-header">
              <div className="rate-pair">
                <img src={USDTLogo} alt="USDT" className="rate-icon crypto-logo-small" />
                <span className="rate-names">USDT/USD</span>
              </div>
            </div>
            <div className="rate-value">
              <span className={`rate-trend ${marketData.USDT.change24h >= 0 ? 'up' : marketData.USDT.change24h < 0 ? 'down' : 'neutral'}`}>
                <span className="material-symbols-outlined">
                  {marketData.USDT.change24h > 0 ? 'trending_up' : marketData.USDT.change24h < 0 ? 'trending_down' : 'trending_flat'}
                </span>
              </span>
              <span className="current-rate">
                {marketLoading ? '...' : `$${marketData.USDT.price.toFixed(4)}`}
              </span>

              <div className="rate-change">
                <span className={`change-percent ${marketData.USDT.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {marketData.USDT.change24h >= 0 ? '+' : ''}{marketData.USDT.change24h.toFixed(2)}%
                </span>
              </div>
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
