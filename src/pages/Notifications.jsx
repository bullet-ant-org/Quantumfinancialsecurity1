import React, { useState, useEffect } from 'react';
import './Notifications.css';

const getIconForType = (type) => {
  switch (type) {
    case 'success': return 'check_circle';
    case 'alert': return 'warning';
    case 'info': return 'info';
    case 'error': return 'error';
    default: return 'notifications';
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
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
        setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
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
        setNotifications(notifications.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  return (
    <div className="notifications-page">
      <h1 className="dashboard-title">Notifications</h1>

      <div className="notification-controls">
        <div className="notification-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Unread</button>
        </div>
        <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
          Mark all as read
        </button>
      </div>

      <div className="notifications-list">
        {loading ? <p>Loading notifications...</p> : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div key={notification._id} className={`notification-item ${notification.type} ${notification.read ? 'read' : ''}`}>
              <div className="notification-icon">
                <span className="material-symbols-outlined">{getIconForType(notification.type)}</span>
              </div>
              <div className="notification-content">
                <h5 className="notification-title">{notification.title}</h5>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-timestamp">{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button className="action-btn mark-read" title="Mark as read" onClick={() => handleMarkAsRead(notification._id)}>
                    <span className="material-symbols-outlined">done</span>
                  </button>
                )}
                <button className="action-btn delete" title="Delete notification" onClick={() => handleDelete(notification._id)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <span className="material-symbols-outlined">notifications_off</span>
            <p>You have no {filter === 'unread' ? 'unread' : ''} notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;