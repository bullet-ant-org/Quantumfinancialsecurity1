import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

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
    const localUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (localUser) setUser(localUser);

    if (!token) return;

    const fetchUserData = async () => {
      try {
        const userRes = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
          localStorage.setItem('user', JSON.stringify(userData.user));
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    const fetchNotificationsData = async () => {
      try {
        const countRes = await fetch(`${apiUrl}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (countRes.ok) {
          const countData = await countRes.json();
          setUnreadCount(countData.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread count', error);
      }

      try {
        const notifRes = await fetch(`${apiUrl}/notifications?limit=4`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.notifications || []);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
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

  const isVerified = Boolean(user?.stellarAddress || user?.rippleAddress);
  const profilePath = user?.role === 'admin' ? '/admin/profile' : '/user/profile';
  const notificationsPath = user?.role === 'admin' ? '/admin/notifications' : '/user/notifications';
  const transactionsPath = user?.role === 'admin' ? '/admin/portfolios' : '/user/transactions';

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="navbar-greeting">
          Hi{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''} 👋
        </span>
      </div>

      <div className="navbar-right">
        <div className={`account-status ${isVerified ? 'verified' : 'unverified'}`}>
          <span className="status-circle" />
          {isVerified ? 'Verified' : 'Unverified'}
        </div>

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
                  to={notificationsPath}
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
            className="user-chip"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            title="Account menu"
          >
            <span className="user-chip__avatar">{getInitials(user?.fullName || user?.username)}</span>
            <span className="user-chip__info">
              <span className="user-chip__name">{user?.username || 'Account'}</span>
              <span className="user-chip__role">{user?.role === 'admin' ? 'Administrator' : 'Member'}</span>
            </span>
            <span className="material-symbols-outlined user-chip__chevron">expand_more</span>
          </button>

          {showUserDropdown && (
            <div className="user-dropdown-menu">
              <Link to={profilePath} className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                <span className="material-symbols-outlined">person</span>
                Profile
              </Link>
              <Link to={transactionsPath} className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                <span className="material-symbols-outlined">swap_vert</span>
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
                <span className="material-symbols-outlined">logout</span>
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
