import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardNavbar = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchUnreadCount = async () => {
      if (token) {
        try {
          const res = await fetch(`${apiUrl}/notifications/unread-count`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) setUnreadCount(data.count);
        } catch (error) {
          console.error('Failed to fetch unread count', error);
        }
      }
    }
    fetchUnreadCount();
  }, [apiUrl, token]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Check if user has connected wallet (verified status)
  const isVerified = user?.stellarAddress || user?.rippleAddress;

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <div className="navbar-center">
        <div className="account-status">
          <span className="status-text">{isVerified ? 'Verified' : 'Unverified'}</span>
          <div className={`status-circle ${isVerified ? 'verified' : 'unverified'}`}></div>
        </div>
      </div>

      <div className="navbar-right">
        <Link to={user?.role === 'admin' ? '/admin/notifications' : '/user/notifications'} className="notification-bell">
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </Link>
        <div className="dropdown user-dropdown-container">
          <button className="btn dropdown-toggle user-dropdown d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span className="material-symbols-outlined">person</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><Link className="dropdown-item" to={user?.role === 'admin' ? '/admin/profile' : '/user/profile'}>
              <span className="material-symbols-outlined">settings</span> Profile
            </Link></li>
            <li><Link className="dropdown-item" to={user?.role === 'admin' ? '/admin/portfolios' : '/user/transactions'}>
              <span className="material-symbols-outlined">receipt_long</span> Transactions
            </Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item" onClick={handleLogout}>
              <span className="material-symbols-outlined">logout</span> Logout
            </button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
