import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./UserProfile.css";

const API_URL = import.meta.env.VITE_API_URL;

const ProfileSummaryCard = ({ user }) => (
  <div className="profile-summary-card">
    <div className="profile-avatar-wrapper">
      <div className="profile-avatar">
        <span className="material-symbols-outlined">account_circle</span>
      </div>
      <button className="avatar-upload-button" title="Upload new picture">
        <span className="material-symbols-outlined">photo_camera</span>
      </button>
    </div>
    <h2 className="profile-username">{user.fullName || user.username}</h2>
    <p className="profile-email">{user.email}</p>
    <div className="profile-details">
      <p><strong> <span className='colorchange'>Role:</span></strong> <span className="profile-role">{user.role}</span></p>
      <p><strong><span className='colorchange'>Joined:</span></strong> <span>{new Date(user.createdAt).toLocaleDateString()}</span></p>
    </div>
  </div>
);

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
      <h3>Edit Information</h3>
      <div className="input-group">
        <input id="fullName" type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} placeholder=" " required />
        <label htmlFor="fullName">Full Name</label>
      </div>
      <div className="input-group">
        <input id="username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder=" " required />
        <label htmlFor="username">Username</label>
      </div>
      <div className="input-group">
        <input id="email" type="email" name="email" value={formData.email} className="form-control" placeholder=" " disabled />
        <label htmlFor="email">Email</label>
      </div>
      <button type="submit" className="profile-button" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
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
      <h3>Change Password</h3>
      <div className="input-group">
        <input id="currentPassword" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handleChange} placeholder=" " required />
        <label htmlFor="currentPassword">Current Password</label>
      </div>
      <div className="input-group">
        <input id="newPassword" type="password" name="newPassword" value={passwordData.newPassword} onChange={handleChange} placeholder=" " required />
        <label htmlFor="newPassword">New Password</label>
      </div>
      <div className="input-group">
        <input id="confirmNewPassword" type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handleChange} placeholder=" " required />
        <label htmlFor="confirmNewPassword">Confirm New Password</label>
      </div>
      <button type="submit" className="profile-button" disabled={loading}>
        {loading ? 'Saving...' : 'Change Password'}
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

  const navigate = useNavigate();
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
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Could not fetch user profile.');
        }
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  if (loading || !user) return <div className="loading-message">Loading Profile...</div>;

  return (
    <div className="user-profile-page">


      {notification.message && (
        <div className={`profile-notification ${notification.type} animated`}>
          {notification.message}
        </div>
      )}

      <div className="profile-container animated">
        <ProfileSummaryCard user={user} />

        <div className="profile-form-card">
          <div className="profile-tabs">
            <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <span className="material-symbols-outlined">person</span>
              <span className='colorchange'>Profile</span>
            </button>
            <button className={`tab-button ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
              <span className="material-symbols-outlined">lock</span>
              <span className='colorchange'>Security</span>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'profile' && (
              <ProfileUpdateForm
                user={{ ...user, fullName: user.fullName || '' }}
                onUpdate={handleProfileUpdate}
                loading={profileLoading} />
            )}
            {activeTab === 'password' && (
              <PasswordUpdateForm onUpdate={handlePasswordUpdate} loading={passwordLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
