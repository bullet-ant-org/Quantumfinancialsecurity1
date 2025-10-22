import React, { useState, useEffect, useMemo } from 'react';
import './UserManagement.css';


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users.');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role.');
      // Refresh user list to show the change
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user.');
      // Refresh user list
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const cardStatus = (user.cardStatus && user.cardStatus !== 'None') ? 'active' : 'inactive';
        return statusFilter === 'all' || cardStatus === statusFilter;
      })
      .filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, searchTerm, statusFilter]);

  if (loading) return <div className="text-white text-center p-5">Loading Users...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  return (
    <div className="user-management">
      <h1 className="dashboard-title">User Management</h1>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by username or email..."
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Card Statuses</option>
          <option value="active">Active Card</option>
          <option value="inactive">No Card</option>
        </select>
      </div>

      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Role</th>
              <th>Card Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>${(user.balance || 0).toFixed(2)}</td>
                <td>
                  <select
                    className="role-select"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge status-${(user.cardStatus && user.cardStatus !== 'None') ? 'active' : 'inactive'}`}>
                    {(user.cardStatus && user.cardStatus !== 'None') ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;