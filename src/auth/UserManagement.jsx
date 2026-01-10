import React, { useState, useEffect, useMemo } from 'react';
import useApi from '../hooks/useApi'; // Assuming you create a hooks folder
import './UserManagement.css';

const api = {
  getUsers: (apiUrl, token) => fetch(`${apiUrl}/users`, {
    headers: { 'Authorization': `Bearer ${token}` },
  }),
  updateUser: (apiUrl, token, userId, data) => fetch(`${apiUrl}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  }),
  deleteUser: (apiUrl, token, userId) => fetch(`${apiUrl}/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  }),
};

const UserRow = ({ user, onRoleChange, onDeleteUser }) => (
  <tr key={user._id}>
    <td>{user.username}</td>
    <td>{user.email}</td>
    <td>${(user.balance || 0).toFixed(2)}</td>
    <td>
      <select
        className="role-select"
        value={user.role}
        onChange={(e) => onRoleChange(user._id, e.target.value)}
        disabled={user.role === 'admin'} // Optional: disable role change for other admins
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </td>
    <td>
      <span className={`status-badge status-${(user.cardStatus && user.cardStatus !== 'None') ? 'active' : 'inactive'}`}>
        {user.cardStatus && user.cardStatus !== 'None' ? user.cardStatus : 'Inactive'}
      </span>
    </td>
    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
    <td>
      <button className="action-btn delete-btn" onClick={() => onDeleteUser(user._id)}>
        Delete
      </button>
    </td>
  </tr>
);

const UserTable = ({ users, onRoleChange, onDeleteUser }) => (
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
        {users.map(user => (
          <UserRow key={user._id} user={user} onRoleChange={onRoleChange} onDeleteUser={onDeleteUser} />
        ))}
      </tbody>
    </table>
  </div>
);

const UserManagement = () => {
  const { data: usersData, loading, error, request: fetchUsers, setData: setUsersData } = useApi(api.getUsers);
  const { request: updateUser } = useApi(api.updateUser);
  const { request: deleteUserApi } = useApi(api.deleteUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const users = usersData?.users || [];

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    setActionError(null);
    const { success, error: updateErr } = await updateUser(userId, { role: newRole });
    if (success) {
      // Optimistically update the UI or refetch
      setUsersData(prevData => ({
        ...prevData,
        users: prevData.users.map(u => u._id === userId ? { ...u, role: newRole } : u),
      }));
    } else {
      setActionError(updateErr);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    setActionError(null);
    const { success, error: deleteErr } = await deleteUserApi(userId);
    if (success) {
      // Optimistically update the UI or refetch
      setUsersData(prevData => ({
        ...prevData,
        users: prevData.users.filter(u => u._id !== userId),
      }));
    } else {
      setActionError(deleteErr);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        if (statusFilter === 'all') return true;
        const hasActiveCard = user.cardStatus && user.cardStatus !== 'None';
        return statusFilter === 'active' ? hasActiveCard : !hasActiveCard;
      })
      .filter(user =>
        (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [users, searchTerm, statusFilter]);

  const displayError = error || actionError;

  return (
    <div className="user-management">
      <h1 className="dashboard-title">User Management</h1>

      {displayError && <div className="error-banner">{displayError}</div>}

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

      {loading && users.length === 0 ? (
        <div className="text-white text-center p-5">Loading Users...</div>
      ) : (
        <UserTable users={filteredUsers} onRoleChange={handleRoleChange} onDeleteUser={handleDeleteUser} />
      )}
    </div>
  );
};

export default UserManagement;