import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
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

  return (
    <div className="user-dashboard animated">
      <div className="balance-display">
        <p className="balance-label">Total Portfolio Value</p>
        <h2 className="balance-amount">
          ${(portfolio?.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
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
      <div className="row g-4 mt-4">
        <div className="col-lg-7">
          <div className="dashboard-card">
            <h5 className="card-title"><span className="material-symbols-outlined">swap_vert</span> Recent Transactions</h5>
            <div className="list-container">
              <ul className="transaction-list">
                {transactions.length > 0 ? transactions.map(tx => (
                  <li key={tx._id}>
                    <div className="list-item-main">
                      <span className="list-item-type">{tx.type}</span>
                      <span className={`list-item-amount ${tx.type === 'credit' ? 'credit' : 'debit'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="list-item-sub">
                      <span className="list-item-date">{new Date(tx.createdAt).toLocaleDateString()}</span>
                      <span className={`list-item-status status-${tx.status.toLowerCase()}`}>{tx.status}</span>
                    </div>
                  </li>
                )) : (
                  <div className="no-data-message">No recent transactions.</div>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="dashboard-card">
            <h5 className="card-title"><span className="material-symbols-outlined">feed</span> Crypto News</h5>
            <div className="list-container">
              <ul className="news-list">
                {news.length > 0 ? news.map(article => (
                  <li key={article.id}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      {article.title}
                      <span className="news-source">{article.source} - {new Date(article.published_on * 1000).toLocaleDateString()}</span>
                    </a>
                  </li>
                )) : (
                  <div className="no-data-message">Could not load news.</div>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
