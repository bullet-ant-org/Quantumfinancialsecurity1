import React, { useState, useEffect, useMemo } from 'react';
import './Tickets.css';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [admins, setAdmins] = useState([]);
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
      // Fetch tickets
      const ticketsRes = await fetch(`${apiUrl}/tickets/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!ticketsRes.ok) throw new Error('Failed to fetch tickets.');
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData.tickets || []);

      // Fetch users to find admins for assignment
      const usersRes = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!usersRes.ok) throw new Error('Failed to fetch users.');
      const usersData = await usersRes.json();
      setAdmins(usersData.users.filter(u => u.role === 'admin'));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateTicket = async (ticketId, updateData) => {
    try {
      const res = await fetch(`${apiUrl}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update ticket.');
      fetchData(); // Refresh data
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(ticket => statusFilter === 'all' || ticket.status === statusFilter)
      .filter(ticket => priorityFilter === 'all' || ticket.priority === priorityFilter)
      .filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const getPriorityClass = (priority) => {
    if (priority === 'high') return 'priority-high';
    if (priority === 'medium') return 'priority-medium';
    return 'priority-low';
  };

  if (loading) return <div className="text-white text-center p-5">Loading Tickets...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  return (
    <div className="tickets-page">
      <h1 className="dashboard-title">Support Tickets</h1>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by title or user..."
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
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
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket._id}>
                <td>
                  <div className="user-info">
                    <div className="username">{ticket.user.username}</div>
                    <div className="email">{ticket.user.email}</div>
                  </div>
                </td>
                <td className="ticket-title">{ticket.title}</td>
                <td className="ticket-category">{ticket.category}</td>
                <td>
                  <select
                    className={`status-select ${getPriorityClass(ticket.priority)}`}
                    value={ticket.priority}
                    onChange={(e) => handleUpdateTicket(ticket._id, { priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>
                <td>
                  <select
                    className="status-select"
                    value={ticket.status}
                    onChange={(e) => handleUpdateTicket(ticket._id, { status: e.target.value })}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>
                  <select
                    className="status-select"
                    value={ticket.assignedTo?._id || ''}
                    onChange={(e) => handleUpdateTicket(ticket._id, { assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {admins.map(admin => (
                      <option key={admin._id} value={admin._id}>{admin.username}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tickets;