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

        // Fetch pre-calculated stats from the backend
        const statsRes = await fetch(`${apiUrl}/stats/admin-dashboard`, { headers });
        if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats');
        const {
          monthlyRegistrations,
          cardStatusCounts,
          recentTransactions,
          recentTickets,
          totalUsers,
          totalTransactions,
          totalRevenue,
          activeTickets
        } = await statsRes.json();

        // Set overview stats
        setStats({
          totalUsers: totalUsers || 0,
          totalTransactions: totalTransactions || 0,
          totalRevenue: totalRevenue || 0,
          activeTickets: activeTickets || 0
        });

        setUserRegistrationData(prev => ({
          ...prev,
          datasets: [{
            label: 'New Users',
            data: monthlyRegistrations,
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          }]
        }));

        setCardStatusData({
          labels: Object.keys(cardStatusCounts),
          datasets: [{
            data: Object.values(cardStatusCounts),
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
        setRecentTransactions(recentTransactions);
        setRecentTickets(recentTickets);

      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 0.5)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#718096',
          font: { size: 12 }
        },
        grid: {
          color: 'rgba(113, 128, 150, 0.1)',
          borderDash: [5, 5]
        },
        border: { display: false }
      },
      x: {
        ticks: {
          color: '#718096',
          font: { size: 12 }
        },
        grid: {
          display: false
        },
        border: { display: false }
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#718096',
          font: { size: 12 },
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 0.5)',
        borderWidth: 1,
      }
    },
    cutout: '70%',
  };

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
          change={8.2}
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          icon="attach_money"
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={15.3}
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          icon="support_agent"
          title="Active Tickets"
          value={stats.activeTickets.toString()}
          change={-5.1}
          color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        />
      </div>

      {/* Charts Section */}
     

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
