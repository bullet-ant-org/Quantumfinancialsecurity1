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

  return (
    <nav className="dashboard-navbar">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>&#9776;</button>
      <div className="ms-auto d-flex align-items-center">
        <span className="username me-3">Welcome, {user ? user.username : 'Guest'}</span>
        <Link to={user?.role === 'admin' ? '/admin/notifications' : '/user/notifications'} className="notification-bell me-3">
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </Link>
        <div className="dropdown user-dropdown-container">
          <button className="btn dropdown-toggle user-dropdown d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="material-symbols-outlined">
              arrow_drop_down
            </span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><Link className="dropdown-item" to={user?.role === 'admin' ? '/admin/profile' : '/user/profile'}>Profile</Link></li>
            <li><Link className="dropdown-item" to={user?.role === 'admin' ? '/admin/portfolios' : '/user/transactions'}>Transactions</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;