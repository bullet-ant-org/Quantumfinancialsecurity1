import React, { useState, useEffect, useMemo } from 'react';
import './Tickets.css'; // Re-using styles from Tickets.css for consistency

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const disputesRes = await fetch(`${apiUrl}/disputes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!disputesRes.ok) throw new Error('Failed to fetch disputes.');
      const disputesData = await disputesRes.json();
      setDisputes(disputesData.disputes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateDispute = async (disputeId, updateData) => {
    try {
      const res = await fetch(`${apiUrl}/disputes/${disputeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update dispute.');
      fetchData(); // Refresh data
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredDisputes = useMemo(() => {
    return disputes
      .filter(d => statusFilter === 'all' || d.status === statusFilter)
      .filter(d => priorityFilter === 'all' || d.priority === priorityFilter)
      .filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.transaction.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [disputes, searchTerm, statusFilter, priorityFilter]);

  const getPriorityClass = (priority) => {
    if (priority === 'high') return 'priority-high';
    if (priority === 'medium') return 'priority-medium';
    return 'priority-low';
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  };

  if (loading) return <div className="text-white text-center p-5">Loading Disputes...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  return (
    <div className="tickets-page">
      <h1 className="dashboard-title">Dispute Management</h1>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by reason, user, or transaction ID..."
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="ticket-table-container">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Reason</th>
              <th>Transaction ID</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisputes.map(dispute => (
              <tr key={dispute._id}>
                <td>
                  <div className="user-info">
                    <div className="username">{dispute.user.username}</div>
                    <div className="email">{dispute.user.email}</div>
                  </div>
                </td>
                <td className="ticket-title">{dispute.title}</td>
                <td className="ticket-category">{dispute.transaction}</td>
                <td>
                  <select
                    className={`status-select ${getPriorityClass(dispute.priority)}`}
                    value={dispute.priority}
                    onChange={(e) => handleUpdateDispute(dispute._id, { priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>
                <td>
                  <select
                    className={`status-select ${getStatusClass(dispute.status)}`}
                    value={dispute.status}
                    onChange={(e) => handleUpdateDispute(dispute._id, { status: e.target.value })}
                  >
                    <option value="open">Open</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>{new Date(dispute.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Disputes;