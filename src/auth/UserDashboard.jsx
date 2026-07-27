import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import './UserDashboard.css';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import TradingViewWidget from '../components/TradingViewWidget';
import useMarketData from '../hooks/useMarketData';
import XRPLogo from '../assets/xrplogo.png';
import XLMLogo from '../assets/xlmlogo.png';
import USDTLogo from '../assets/usdtlogo.png';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = ['#00e1ff', '#ff4b8d', '#ffd700', '#2ee6a8', '#ff9800', '#9c27b0', '#3f51b5'];

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [ticketCount, setTicketCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const { marketData, loading: marketLoading } = useMarketData();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (localUser) setUser(localUser);

    if (!token) {
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Each data source is fetched and handled independently so that one
    // failing or unavailable endpoint never blanks out the whole dashboard.
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`${apiUrl}/portfolio`, { headers });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPortfolio(data.isAdmin ? null : data.portfolio);
      } catch {
        setPortfolio(null);
      }
    };

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${apiUrl}/transactions`, { headers });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const sorted = (data.transactions || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTransactions(sorted.slice(0, 6));
      } catch {
        setTransactions([]);
      }
    };

    const fetchTickets = async () => {
      try {
        const res = await fetch(`${apiUrl}/tickets`, { headers });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const tickets = data.tickets || data || [];
        const open = Array.isArray(tickets)
          ? tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved').length
          : 0;
        setTicketCount(open);
      } catch {
        setTicketCount(null);
      }
    };

    Promise.allSettled([fetchPortfolio(), fetchTransactions(), fetchTickets()]).finally(() => {
      setLoading(false);
    });
  }, [apiUrl, token]);

  const assets = portfolio?.assets || [];
  const getAsset = (symbol) => assets.find((a) => a.symbol === symbol);

  const chartData = assets.length > 0 ? {
    labels: assets.map((a) => a.symbol),
    datasets: [{
      data: assets.map((a) => a.value || 0),
      backgroundColor: CHART_COLORS,
      borderColor: 'transparent',
      borderWidth: 2,
    }],
  } : null;

  const isVerified = Boolean(user?.stellarAddress || user?.rippleAddress);

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-loading__spinner" />
        <p>Loading your dashboard\u2026</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {loadError && <div className="dash-banner">{loadError}</div>}

      <div className="dash-header">
        <div>
          <h1>Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}</h1>
          <p>Here's what's happening with your vault today.</p>
        </div>
        <div className={`verify-pill ${isVerified ? 'verified' : 'unverified'}`}>
          <span className="verify-pill__dot" />
          {isVerified ? 'Wallet verified' : 'Wallet not connected'}
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/user/send" className="quick-action">
          <span className="material-symbols-outlined">send</span>
          Send
        </Link>
        <Link to="/user/request" className="quick-action">
          <span className="material-symbols-outlined">call_received</span>
          Request
        </Link>
        <Link to="/user/connect-wallet" className="quick-action">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          Connect wallet
        </Link>
        <Link to="/user/cards" className="quick-action">
          <span className="material-symbols-outlined">credit_card</span>
          Cards
        </Link>
        <Link to="/user/create-ticket" className="quick-action">
          <span className="material-symbols-outlined">note_add</span>
          Get support
        </Link>
      </div>

      <div className="dash-grid">
        <section className="dash-card dash-card--balances">
          <h3>Account balances</h3>
          <div className="balance-list">
            <div className="balance-row">
              <img src={XRPLogo} alt="XRP" />
              <div className="balance-row__info">
                <span className="balance-row__symbol">XRP</span>
                <span className="balance-row__label">Ripple</span>
              </div>
              <span className="balance-row__amount">
                {getAsset('XRP')?.quantity?.toFixed(4) ?? '0.0000'}
              </span>
            </div>
            <div className="balance-row">
              <img src={XLMLogo} alt="XLM" />
              <div className="balance-row__info">
                <span className="balance-row__symbol">XLM</span>
                <span className="balance-row__label">Stellar</span>
              </div>
              <span className="balance-row__amount">
                {getAsset('XLM')?.quantity?.toFixed(4) ?? '0.0000'}
              </span>
            </div>
          </div>
          {!portfolio && (
            <p className="balance-empty">Connect a wallet to see live balances here.</p>
          )}
        </section>

        <section className="dash-card dash-card--allocation">
          <h3>Portfolio allocation</h3>
          {chartData ? (
            <div className="allocation-chart">
              <Doughnut
                data={chartData}
                options={{
                  plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-secondary)', boxWidth: 10, padding: 14 } } },
                  cutout: '68%',
                }}
              />
            </div>
          ) : (
            <div className="allocation-empty">
              <span className="material-symbols-outlined">pie_chart</span>
              <p>No assets to show yet</p>
            </div>
          )}
        </section>

        <section className="dash-card dash-card--activity">
          <h3>Snapshot</h3>
          <div className="snapshot-list">
            <div className="snapshot-row">
              <span className="material-symbols-outlined">swap_vert</span>
              <div>
                <span className="snapshot-row__label">Recent transactions</span>
                <span className="snapshot-row__value">{transactions.length}</span>
              </div>
            </div>
            <div className="snapshot-row">
              <span className="material-symbols-outlined">confirmation_number</span>
              <div>
                <span className="snapshot-row__label">Open support tickets</span>
                <span className="snapshot-row__value">{ticketCount ?? '\u2014'}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="dash-card dash-card--rates">
        <h3>Market rates</h3>
        <div className="rates-grid">
          {[
            { symbol: 'XRP', logo: XRPLogo, pair: 'XRP/USDT' },
            { symbol: 'XLM', logo: XLMLogo, pair: 'XLM/USDT' },
            { symbol: 'USDT', logo: USDTLogo, pair: 'USDT/USD' },
          ].map((row) => {
            const m = marketData[row.symbol];
            const up = m.change24h >= 0;
            return (
              <div className="rate-card" key={row.symbol}>
                <div className="rate-card__top">
                  <img src={row.logo} alt={row.symbol} />
                  <span>{row.pair}</span>
                </div>
                <div className="rate-card__bottom">
                  <span className="rate-card__price">
                    {marketLoading ? '\u2026' : `$${m.price.toFixed(4)}`}
                  </span>
                  <span className={`rate-card__change ${up ? 'up' : 'down'}`}>
                    <span className="material-symbols-outlined">{up ? 'trending_up' : 'trending_down'}</span>
                    {up ? '+' : ''}{m.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dash-card dash-card--market">
        <h3><span className="material-symbols-outlined">trending_up</span> Market overview</h3>
        <div className="tradingview-widget-wrapper">
          <TradingViewWidget />
        </div>
      </section>

      <section className="dash-card dash-card--transactions">
        <h3>Recent activity</h3>
        {transactions.length > 0 ? (
          <div className="tx-list">
            {transactions.map((tx) => (
              <div className="tx-row" key={tx._id}>
                <span className={`tx-row__icon ${tx.type}`}>
                  <span className="material-symbols-outlined">
                    {tx.type === 'deposit' ? 'south_west' : tx.type === 'withdraw' ? 'north_east' : 'swap_horiz'}
                  </span>
                </span>
                <div className="tx-row__info">
                  <span className="tx-row__type">{tx.type}</span>
                  <span className="tx-row__date">{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="tx-row__amount">
                  {tx.amount} {tx.currency || ''}
                </span>
                <span className={`tx-row__status ${tx.status}`}>{tx.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="tx-empty">
            <span className="material-symbols-outlined">receipt_long</span>
            <p>No transactions yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;
