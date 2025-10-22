import React, { useState, useEffect, useMemo } from 'react';
import './UserTransactions.css'; // Re-using styles for consistency
import TransactionDetailModal from './TransactionDetailModal';

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch transactions.');
        const data = await res.json();
        const sorted = (data.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => statusFilter === 'all' || tx.status === statusFilter)
      .filter(tx => typeFilter === 'all' || tx.type === typeFilter)
      .filter(tx =>
        (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.type || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const getStatusClass = (status) => `status-${status.toLowerCase()}`;
  const getAmountClass = (type) => type === 'credit' ? 'credit' : 'debit';

  if (loading) return <div className="text-white text-center p-5">Loading Transactions...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  return (
    <>
      <div className="tickets-page"> {/* Reusing tickets-page for layout */}
        <h1 className="dashboard-title">Transaction History</h1>

        <div className="filters-bar">
          <input
            type="text"
            placeholder="Search by description or type..."
            className="search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>

        <div className="ticket-table-container">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx._id} onClick={() => setSelectedTransaction(tx)} className="clickable-row">
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="ticket-category">{tx.type}</td>
                  <td className="ticket-title">{tx.description || 'N/A'}</td>
                  <td>
                    <span className={`list-item-amount ${getAmountClass(tx.type)}`}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-4">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
    </>
  );
};

export default UserTransactions;