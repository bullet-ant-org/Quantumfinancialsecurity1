import React, { useState, useEffect } from 'react';
import './Profile.css'; // We will update this file next

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Could not fetch user profile.');
        }
        const data = await res.json();
        setUser(data);
        setFormData({
          username: data.username,
          email: data.email,
          fullName: data.fullName || '',
        });
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    };
    fetchUserProfile();
  }, [apiUrl, token]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${apiUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile.');

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match.' });
    }

    try {
      const res = await fetch(`${apiUrl}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password.');

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (!user) {
    return <div className="text-center text-white p-5">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <h1 className="dashboard-title">My Profile</h1>

      {message.text && <div className={`alert-message ${message.type}`}>{message.text}</div>}
      
      <div className="profile-container">
        {/* Left Side: User Info Summary */}
        <div className="profile-summary-card">
          <i className="bi bi-person-circle profile-avatar"></i>
          <h2 className="profile-username">{user.username}</h2>
          <p className="profile-email">{user.email}</p>
          <span className="profile-role">{user.role}</span>
          <div className="profile-details">
            <p><strong>Full Name:</strong> <span>{user.fullName || 'Not set'}</span></p>
            <p><strong>Joined:</strong> <span>{new Date(user.createdAt).toLocaleDateString()}</span></p>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="profile-form-card">
          <div className="profile-tabs">
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>Security</button>
          </div>

          {activeTab === 'profile' && (
            <div className="tab-content">
              <h3>Edit Information</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="input-group">
                  <input type="text" id="username" name="username" value={formData.username} onChange={handleFormChange} placeholder=" " required />
                  <label htmlFor="username">Username</label>
                </div>
                <div className="input-group">
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} placeholder=" " required />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="input-group">
                  <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleFormChange} placeholder=" " required />
                  <label htmlFor="fullName">Full Name</label>
                </div>
                <button type="submit" className="profile-button">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordUpdate}>
                <div className="input-group">
                  <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder=" " required />
                  <label htmlFor="currentPassword">Current Password</label>
                </div>
                <div className="input-group">
                  <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder=" " required />
                  <label htmlFor="newPassword">New Password</label>
                </div>
                <div className="input-group">
                  <input type="password" id="confirmPassword" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder=" " required />
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                </div>
                <button type="submit" className="profile-button">Update Password</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
