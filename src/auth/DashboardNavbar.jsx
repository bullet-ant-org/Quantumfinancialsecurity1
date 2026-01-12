import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const DashboardNavbar = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          // Fetch fresh user data from backend
          const userRes = await fetch(`${apiUrl}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.user);
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(userData.user));
          } else {
            // Fallback to localStorage if API fails
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        } catch (error) {
          console.error('Failed to fetch user data', error);
          // Fallback to localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      }
    };

    const fetchNotificationsData = async () => {
      if (token) {
        try {
          // Fetch unread count
          const countRes = await fetch(`${apiUrl}/notifications/unread-count`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const countData = await countRes.json();
          if (countRes.ok) {
            setUnreadCount(countData.count || 0);
          }

          // Fetch top 4 notifications
          const notifRes = await fetch(`${apiUrl}/notifications?limit=4`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const notifData = await notifRes.json();
          if (notifRes.ok) {
            setNotifications(notifData.notifications || []);
          }
        } catch (error) {
          console.error('Failed to fetch notifications data', error);
          // Set default values on error
          setUnreadCount(0);
          setNotifications([]);
        }
      }
    };

    fetchUserData();
    fetchNotificationsData();
  }, [apiUrl, token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
          <span className="material-symbols-outlined">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notification Dropdown */}
        <div className="notification-dropdown-container" ref={dropdownRef}>
          <button
            className="notification-bell"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            title="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotificationDropdown && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <Link
                  to={user?.role === 'admin' ? '/admin/notifications' : '/user/notifications'}
                  className="view-all-link"
                  onClick={() => setShowNotificationDropdown(false)}
                >
                  View All
                </Link>
              </div>

              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-icon">
                        <span className="material-symbols-outlined">
                          {notification.type === 'transaction' && 'receipt_long'}
                          {notification.type === 'security' && 'security'}
                          {notification.type === 'system' && 'info'}
                          {notification.type === 'dispute' && 'gavel'}
                          {!notification.type && 'notifications'}
                        </span>
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {!notification.read && <div className="unread-indicator"></div>}
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <span className="material-symbols-outlined">notifications_off</span>
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
