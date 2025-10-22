import React, { useState, useEffect, useMemo } from 'react';
import './Tickets.css'; // Reusing styles
import './UserTransactions.css'; // For status badges
import DisputeDetailModal from './DisputeDetailModal';

const UserDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/disputes`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch your disputes.');
        const data = await res.json();
        setDisputes(data.disputes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  const filteredDisputes = useMemo(() => {
    return disputes
      .filter(d => statusFilter === 'all' || d.status === statusFilter)
      .filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.transaction?._id || d.transaction).toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [disputes, searchTerm, statusFilter]);

  const getStatusClass = (status) => `status-${status.toLowerCase().replace(/_/g, '-')}`;

  if (loading) return <div className="text-white text-center p-5">Loading Your Disputes...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  return (
    <>
      <div className="tickets-page">
        <h1 className="dashboard-title">My Disputes</h1>

        <div className="filters-bar">
          <input
            type="text"
            placeholder="Search by reason or transaction ID..."
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
        </div>

        <div className="ticket-table-container">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Date Submitted</th>
                <th>Reason</th>
                <th>Transaction ID</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDisputes.map(d => (
                <tr key={d._id} onClick={() => setSelectedDispute(d)} className="clickable-row">
                  <td>{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="ticket-title">{d.title}</td>
                  <td className="ticket-category">{d.transaction?._id || d.transaction}</td>
                  <td className="ticket-category">{d.priority}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(d.status)}`}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredDisputes.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-4">No disputes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DisputeDetailModal dispute={selectedDispute} onClose={() => setSelectedDispute(null)} />
    </>
  );
};

export default UserDisputes;