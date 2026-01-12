import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import './AdminDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({ icon, title, value, change, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color }}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="stat-content">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-title">{title}</p>
      {change && (
        <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeTickets: 0
  });

  const [userRegistrationData, setUserRegistrationData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [],
  });

  const [cardStatusData, setCardStatusData] = useState({
    labels: [],
    datasets: [],
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const apiUrl = import.meta.env.VITE_API_URL;

        // Fetch data from direct endpoints
        const [transactionsRes, portfolioRes, ticketsRes, usersRes] = await Promise.all([
          fetch(`${apiUrl}/transactions/admin/all`, { headers }),
          fetch(`${apiUrl}/portfolio/admin/total-value`, { headers }),
          fetch(`${apiUrl}/tickets/admin/all`, { headers }),
          fetch(`${apiUrl}/users/admin/stats`, { headers }).catch(() => ({ ok: false })) // Fallback if endpoint doesn't exist
        ]);

        // Parse responses
        const transactionsData = transactionsRes.ok ? await transactionsRes.json() : { totalTransactions: 0, totalRevenue: 0 };
        const portfolioData = portfolioRes.ok ? await portfolioRes.json() : { totalPortfolioValue: 0 };
        const ticketsData = ticketsRes.ok ? await ticketsRes.json() : { tickets: [] };
        const usersData = usersRes.ok ? await usersRes.json() : { totalUsers: 0, monthlyRegistrations: new Array(12).fill(0), cardStatusCounts: {} };

        // Calculate active tickets
        const activeTickets = ticketsData.tickets ? ticketsData.tickets.filter(ticket =>
          ticket.status !== 'closed' && ticket.status !== 'resolved'
        ).length : 0;

        // Set overview stats
        setStats({
          totalUsers: usersData.totalUsers || 0,
          totalTransactions: transactionsData.totalTransactions || 0,
          totalRevenue: (transactionsData.totalRevenue || 0) + (portfolioData.totalPortfolioValue || 0), // Combine transaction revenue + portfolio value
          activeTickets: activeTickets || 0
        });

        // Set chart data
        setUserRegistrationData(prev => ({
          ...prev,
          datasets: [{
            label: 'New Users',
            data: usersData.monthlyRegistrations || new Array(12).fill(0),
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          }]
        }));

        setCardStatusData({
          labels: Object.keys(usersData.cardStatusCounts || {}),
          datasets: [{
            data: Object.values(usersData.cardStatusCounts || {}),
            backgroundColor: [
              'rgba(113, 128, 150, 0.8)', // None
              'rgba(205, 127, 50, 0.9)',  // Bronze
              'rgba(192, 192, 192, 0.9)', // Silver
              'rgba(255, 215, 0, 0.9)',  // Gold
            ],
            borderColor: 'rgba(26, 26, 26, 0.8)',
            borderWidth: 2,
            hoverBorderWidth: 3,
          }]
        });

        // Set recent data (limit to 5)
        setRecentTransactions(transactionsData.transactions ? transactionsData.transactions.slice(0, 5) : []);
        setRecentTickets(ticketsData.tickets ? ticketsData.tickets.slice(0, 5) : []);

      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch realtime stats every 30 seconds
  useEffect(() => {
    const fetchRealtimeStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const apiUrl = import.meta.env.VITE_API_URL;

        const realtimeRes = await fetch(`${apiUrl}/stats/realtime`, { headers });
        if (realtimeRes.ok) {
          const {
            totalTransactions,
            totalRevenue,
            activeTickets,
            transactionGrowthPercent,
            revenueGrowthPercent,
            ticketChangePercent
          } = await realtimeRes.json();

          // Update only the realtime stats
          setStats(prev => ({
            ...prev,
            totalTransactions: totalTransactions || prev.totalTransactions,
            totalRevenue: totalRevenue || prev.totalRevenue,
            activeTickets: activeTickets || prev.activeTickets,
            transactionGrowthPercent: transactionGrowthPercent ?? prev.transactionGrowthPercent ?? 8.2,
            revenueGrowthPercent: revenueGrowthPercent ?? prev.revenueGrowthPercent ?? 15.3,
            ticketChangePercent: ticketChangePercent ?? prev.ticketChangePercent ?? -5.1
          }));
        }
      } catch (err) {
        console.error('Failed to fetch realtime stats:', err);
      }
    };

    // Fetch immediately and then every 30 seconds
    fetchRealtimeStats();
    const interval = setInterval(fetchRealtimeStats, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);



  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Loading Dashboard...</h3>
          <p>Fetching your admin data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <span className="material-symbols-outlined">error_outline</span>
          <h3>Failed to Load Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">Admin Dashboard</h1>
          <p className="hero-subtitle">Monitor your platform's performance and user activity</p>
        </div>
        <div className="hero-stats">
          <div className="current-time">
            <span className="material-symbols-outlined">schedule</span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <StatCard
          icon="people"
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={12.5}
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          icon="receipt_long"
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          change={stats.transactionGrowthPercent ?? 8.2}
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          icon="attach_money"
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowthPercent ?? 15.3}
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          icon="support_agent"
          title="Active Tickets"
          value={stats.activeTickets.toString()}
          change={stats.ticketChangePercent ?? -5.1}
          color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </div>

     
      {/* Data Tables Section */}
      <div className="data-section">
        <div className="data-card">
          <div className="card-header">
            <div className="card-icon">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div className="card-info">
              <h3 className="card-title">Recent Transactions</h3>
              <p className="card-subtitle">Latest platform transactions</p>
            </div>
          </div>
          <div className="data-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, index) => (
                <div key={tx._id || index} className="data-item">
                  <div className="item-avatar">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div className="item-content">
                    <div className="item-title">{tx.user?.username || 'Unknown User'}</div>
                    <div className="item-subtitle">
                      {new Date(tx.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="item-meta">
                    <div className="item-amount">${tx.amount?.toFixed(2) || '0.00'}</div>
                    <span className={`status-badge ${tx.status?.toLowerCase() || 'pending'}`}>
                      {tx.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="material-symbols-outlined">receipt_long</span>
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        <div className="data-card">
          <div className="card-header">
            <div className="card-icon">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div className="card-info">
              <h3 className="card-title">Support Tickets</h3>
              <p className="card-subtitle">Recent customer support requests</p>
            </div>
          </div>
          <div className="data-list">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket, index) => (
                <div key={ticket._id || index} className="data-item">
                  <div className="item-avatar">
                    <span className="material-symbols-outlined">help</span>
                  </div>
                  <div className="item-content">
                    <div className="item-title">{ticket.title || 'Untitled Ticket'}</div>
                    <div className="item-subtitle">
                      {ticket.category || 'General'} • {new Date(ticket.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="item-meta">
                    <span className={`priority-badge ${ticket.priority?.toLowerCase() || 'medium'}`}>
                      {ticket.priority || 'Medium'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="material-symbols-outlined">support_agent</span>
                <p>No recent tickets</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
