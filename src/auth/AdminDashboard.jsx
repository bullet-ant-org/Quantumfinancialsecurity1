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

const AdminDashboard = () => {
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
          recentTickets
        } = await statsRes.json();

        setUserRegistrationData(prev => ({
          ...prev,
          datasets: [{
            label: 'New Users',
            data: monthlyRegistrations,
            backgroundColor: 'rgba(0, 225, 255, 0.6)',
            borderColor: 'rgba(0, 225, 255, 1)',
            borderWidth: 1,
          }]
        }));

        setCardStatusData({
          labels: Object.keys(cardStatusCounts),
          datasets: [{
            data: Object.values(cardStatusCounts),
            backgroundColor: [
              'rgba(0, 225, 255, 0.8)', // Active
              'rgba(255, 255, 255, 0.2)', // None
              'rgba(255, 183, 0, 0.8)',
              'rgba(255, 0, 55, 0.8)',
            ],
            borderColor: '#1a1a1a',
            borderWidth: 1,
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'white' } } },
    scales: {
      y: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: 'white' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
    },
  };

  if (loading) {
    return <div className="text-white text-center p-5">Loading Dashboard...</div>;
  }
  if (error) {
    return <div className="text-danger text-center p-5">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Overview</h1>

      {/* Top Row: Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="dashboard-card">
            <h5 className="card-title"><span className="material-symbols-outlined">bar_chart</span> Monthly User Registrations</h5>
            <div className="chart-wrapper">
              <Bar options={chartOptions} data={userRegistrationData} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="dashboard-card">
            <h5 className="card-title"><span className="material-symbols-outlined">credit_card</span> User Card Status</h5>
            <div className="chart-wrapper">
              <Doughnut data={cardStatusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: 'white' } } } }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Lists */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="dashboard-card">
            <h5 className="card-title"><span className="material-symbols-outlined">receipt_long</span> Recent Transactions</h5>
            <div className="list-container">
              <ul className="transaction-list">
                {recentTransactions.map(tx => (
                  <li key={tx._id}>
                    <div className="list-item-main">
                      <span className="list-item-user">{tx.user?.username || 'N/A'}</span>
                      <span className="list-item-amount">${tx.amount.toFixed(2)}</span>
                    </div>
                    <span className={`list-item-status status-${tx.status.toLowerCase()}`}>{tx.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="dashboard-card">
            <h5 className="card-title"><span className="material-symbols-outlined">support_agent</span> Recent Support Tickets</h5>
            <div className="list-container">
              <ul className="ticket-list">
                {recentTickets.map(ticket => (
                  <li key={ticket._id}>
                    <span className="list-item-title">{ticket.title}</span>
                    <span className="list-item-category">{ticket.category}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;