import React, { useState, useEffect } from 'react';
import "./UserProfile.css";

const API_URL = import.meta.env.VITE_API_URL;

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
};

const ProfileUpdateForm = ({ user, onUpdate, loading }) => {
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h3>Edit information</h3>
      <div className="input-group">
        <input id="fullName" type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} placeholder=" " required />
        <label htmlFor="fullName">Full name</label>
      </div>
      <div className="input-group">
        <input id="username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder=" " required />
        <label htmlFor="username">Username</label>
      </div>
      <div className="input-group">
        <input id="email" type="email" name="email" value={formData.email} placeholder=" " disabled />
        <label htmlFor="email">Email</label>
      </div>
      <button type="submit" className="profile-button" disabled={loading}>
        {loading ? 'Saving\u2026' : 'Save changes'}
      </button>
    </form>
  );
};

const PasswordUpdateForm = ({ onUpdate, loading }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(passwordData, () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h3>Change password</h3>
      <div className="input-group">
        <input id="currentPassword" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handleChange} placeholder=" " required />
        <label htmlFor="currentPassword">Current password</label>
      </div>
      <div className="input-group">
        <input id="newPassword" type="password" name="newPassword" value={passwordData.newPassword} onChange={handleChange} placeholder=" " required />
        <label htmlFor="newPassword">New password</label>
      </div>
      <div className="input-group">
        <input id="confirmNewPassword" type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handleChange} placeholder=" " required />
        <label htmlFor="confirmNewPassword">Confirm new password</label>
      </div>
      <button type="submit" className="profile-button" disabled={loading}>
        {loading ? 'Saving\u2026' : 'Change password'}
      </button>
    </form>
  );
};

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  const token = localStorage.getItem('token');

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not fetch user profile.');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        showNotification('error', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleProfileUpdate = async (formData) => {
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile.');
      showNotification('success', 'Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (passwords, clearForm) => {
    setPasswordLoading(true);
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      showNotification('error', 'New passwords do not match.');
      setPasswordLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password.');
      showNotification('success', 'Password changed successfully!');
      clearForm();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading || !user) return <div className="loading-message">Loading profile\u2026</div>;

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="fb-profile-page">
      {notification.message && (
        <div className={`profile-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Cover + avatar header, Facebook-style */}
      <div className="fb-cover">
        <div className="fb-cover__gradient" />
        <div className="fb-header">
          <div className="fb-avatar">
            <span>{getInitials(user.fullName || user.username)}</span>
            <button className="fb-avatar__camera" title="Change photo">
              <span className="material-symbols-outlined">photo_camera</span>
            </button>
          </div>
          <div className="fb-header__identity">
            <h1>{user.fullName || user.username}</h1>
            <p>@{user.username} &middot; {user.role === 'admin' ? 'Administrator' : 'Member'} since {joined}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="fb-tabbar">
        <button className={`fb-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span className="material-symbols-outlined">person</span>
          Profile
        </button>
        <button className={`fb-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
          <span className="material-symbols-outlined">lock</span>
          Security
        </button>
      </div>

      {/* Two-column body, like Facebook's About page */}
      <div className="fb-body">
        <aside className="fb-intro-card">
          <h4>Intro</h4>
          <ul>
            <li>
              <span className="material-symbols-outlined">badge</span>
              <div>
                <span className="fb-intro-label">Role</span>
                <span className="fb-intro-value">{user.role === 'admin' ? 'Administrator' : 'Member'}</span>
              </div>
            </li>
            <li>
              <span className="material-symbols-outlined">mail</span>
              <div>
                <span className="fb-intro-label">Email</span>
                <span className="fb-intro-value">{user.email}</span>
              </div>
            </li>
            <li>
              <span className="material-symbols-outlined">calendar_month</span>
              <div>
                <span className="fb-intro-label">Joined</span>
                <span className="fb-intro-value">{joined}</span>
              </div>
            </li>
          </ul>
        </aside>

        <div className="fb-content-card">
          {activeTab === 'profile' && (
            <ProfileUpdateForm
              user={{ ...user, fullName: user.fullName || '' }}
              onUpdate={handleProfileUpdate}
              loading={profileLoading}
            />
          )}
          {activeTab === 'password' && (
            <PasswordUpdateForm onUpdate={handlePasswordUpdate} loading={passwordLoading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
