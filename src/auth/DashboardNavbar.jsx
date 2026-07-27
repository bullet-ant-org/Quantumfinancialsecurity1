import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardNavbar = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const notificationDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const userRes = await fetch(`${apiUrl}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.user);
            localStorage.setItem('user', JSON.stringify(userData.user));
          } else {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        } catch (error) {
          console.error('Failed to fetch user data', error);
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
          const countRes = await fetch(`${apiUrl}/notifications/unread-count`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const countData = await countRes.json();
          if (countRes.ok) {
            setUnreadCount(countData.count || 0);
          }

          const notifRes = await fetch(`${apiUrl}/notifications?limit=4`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const notifData = await notifRes.json();
          if (notifRes.ok) {
            setNotifications(notifData.notifications || []);
          }
        } catch (error) {
          console.error('Failed to fetch notifications data', error);
          setUnreadCount(0);
          setNotifications([]);
        }
      }
    };

    fetchUserData();
    fetchNotificationsData();
  }, [apiUrl, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
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
        <div className="notification-dropdown-container" ref={notificationDropdownRef}>
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

        <div className="user-dropdown-container" ref={userDropdownRef}>
          <button
            className="user-dropdown-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            title="Account menu"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>

          {showUserDropdown && (
            <div className="user-dropdown-menu">
              <Link
                to={user?.role === 'admin' ? '/admin/profile' : '/user/profile'}
                className="dropdown-item"
                onClick={() => setShowUserDropdown(false)}
              >
                Profile
              </Link>
              <Link
                to={user?.role === 'admin' ? '/admin/portfolios' : '/user/transactions'}
                className="dropdown-item"
                onClick={() => setShowUserDropdown(false)}
              >
                Transactions
              </Link>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item logout-item"
                onClick={() => {
                  handleLogout();
                  setShowUserDropdown(false);
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
