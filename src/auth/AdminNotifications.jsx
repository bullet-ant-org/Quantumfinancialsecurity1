import React, { useState } from 'react';
import './AdminNotifications.css';

const getIconForType = (type) => {
  switch (type) {
    case 'success': return 'check_circle';
    case 'alert': return 'warning';
    case 'info': return 'info';
    case 'error': return 'error';
    default: return 'campaign';
  }
};

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('info');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const res = await fetch(`${apiUrl}/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, message, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send notification.');
      }

      setFeedback({ type: 'success', text: 'Notification sent successfully to all users!' });
      setTitle('');
      setMessage('');
      setType('info');
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-notifications-page">
      <h1 className="dashboard-title">Broadcast Notification</h1>
      <p className="dashboard-subtitle">Send a notification to all users in the system.</p>

      {feedback.text && <div className={`notification-feedback ${feedback.type}`}>{feedback.text}</div>}

      <div className="broadcast-container">
        <div className="broadcast-form-card">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="title">Notification Title</label>
            </div>
            <div className="input-group">
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder=" " required rows="6"></textarea>
              <label htmlFor="message">Message</label>
            </div>
            <div className="input-group">
              <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="alert">Alert</option>
                <option value="error">Error</option>
              </select>
              <label htmlFor="type">Notification Type</label>
            </div>
            <button type="submit" className="profile-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send to All Users'}
            </button>
          </form>
        </div>

        <div className="broadcast-preview-card">
          <h5 className="preview-title">Live Preview</h5>
          <div className={`notification-item ${type} preview`}>
            <div className="notification-icon">
              <span className="material-symbols-outlined">{getIconForType(type)}</span>
            </div>
            <div className="notification-content">
              <h5 className="notification-title">{title || 'Notification Title'}</h5>
              <p className="notification-message">{message || 'This is where your message will appear.'}</p>
              <span className="notification-timestamp">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;