import React, { useState, useEffect } from 'react';
import './Notifications.css';

const getIconForType = (type) => {
  switch (type) {
    case 'success': return 'check_circle';
    case 'alert': return 'warning';
    case 'info': return 'info';
    case 'error': return 'error';
    case 'transaction': return 'receipt_long';
    case 'security': return 'security';
    case 'system': return 'settings';
    case 'dispute': return 'gavel';
    default: return 'notifications';
  }
};

const getColorForType = (type) => {
  switch (type) {
    case 'success': return 'var(--success-color)';
    case 'alert': return 'var(--warning-color)';
    case 'info': return 'var(--accent-primary)';
    case 'error': return 'var(--error-color)';
    case 'transaction': return 'var(--accent-secondary)';
    case 'security': return '#ff6b35';
    case 'system': return '#6366f1';
    case 'dispute': return '#f59e0b';
    default: return 'var(--text-secondary)';
  }
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}>
      <div className="notification-icon" style={{ backgroundColor: `${getColorForType(notification.type)}15` }}>
        <span className="material-symbols-outlined" style={{ color: getColorForType(notification.type) }}>
          {getIconForType(notification.type)}
        </span>
      </div>

      <div className="notification-content" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="notification pb-2 ">
          <h4 className="notification-title">{notification.title}</h4>
          <div className="notification-meta">
           
            {!notification.read && <span className="unread-indicator"></span>}
          </div>
        </div>

        <p className="notification-message">{notification.message}</p>

        <div className="notification-footer">
          <span className="notification-timestamp">
            {new Date(notification.createdAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      <div className="notification-actions">
        {!notification.read && (
          <button
            className="action-btn mark-read"
            title="Mark as read"
            onClick={() => onMarkAsRead(notification._id)}
          >
            <span className="material-symbols-outlined">done</span>
          </button>
        )}
        <button
          className="action-btn delete"
          title="Delete notification"
          onClick={() => onDelete(notification._id)}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);

        // Calculate stats
        const total = data.length;
        const unread = data.filter(n => !n.read).length;
        setStats({ total, unread });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [apiUrl, token]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(notifications.map(n =>
          n._id === id ? { ...n, read: true } : n
        ));
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch(`${apiUrl}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setStats(prev => ({ ...prev, unread: 0 }));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedNotifications = notifications.filter(n => n._id !== id);
        setNotifications(updatedNotifications);
        setStats({
          total: updatedNotifications.length,
          unread: updatedNotifications.filter(n => !n.read).length
        });
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Loading Notifications...</h3>
          <p>Fetching your latest updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Hero Section */}


      {/* Controls Section */}
      <div className="notifications-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="material-symbols-outlined">list</span>
            All ({stats.total})
          </button>
          <button
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            <span className="material-symbols-outlined">mark_email_unread</span>
            Unread ({stats.unread})
          </button>
        </div>

        {stats.unread > 0 && (
          <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
            <span className="material-symbols-outlined">done_all</span>
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {filteredNotifications.length > 0 ? (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <span className="material-symbols-outlined">notifications_off</span>
            </div>
            <h3>No Notifications</h3>
            <p>
              {filter === 'unread'
                ? "You don't have any unread notifications."
                : "You're all caught up! No notifications to show."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
