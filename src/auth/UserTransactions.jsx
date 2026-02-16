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
  const [currentUser, setCurrentUser] = useState(null); // State to store current user

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await fetch(`${apiUrl}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error("Failed to fetch user data.");
        const userData = await userRes.json();
        setCurrentUser(userData.user); // Set current user
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      }
    };

    fetchUserData();
  }, [apiUrl, token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return; // Only fetch transactions if currentUser is available

      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/transactions`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch transactions.");
        const data = await res.json();
        // Sort transactions by date, newest first
        const sorted = (data.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token, currentUser]); // Re-fetch when currentUser changes

  const getDisplayType = (tx, currentUserId) => {
    switch (tx.type) {
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdrawal';
      case 'send':
        return tx.user === currentUserId ? 'Sent' : 'Received';
      case 'request':
        return tx.user === currentUserId ? 'Request Sent' : 'Request Received';
      default:
        return tx.type;
    }
  };

  const getDisplayAmount = (tx, currentUserId) => {
    let amountPrefix = '';
    if (tx.type === 'deposit') amountPrefix = '+';
    else if (tx.type === 'withdraw') amountPrefix = '-';
    else if (tx.type === 'send') amountPrefix = tx.user === currentUserId ? '-' : '+';
    else if (tx.type === 'request') amountPrefix = tx.user === currentUserId ? '+' : '-'; // Requesting funds is a potential credit for the requester

    // Display currency for crypto transactions
    const currencyDisplay = tx.currency && tx.currency !== 'USD' ? ` ${tx.currency}` : '';

    return `${amountPrefix}${(tx.amount || 0).toFixed(2)}${currencyDisplay}`;
  };

  const filteredTransactions = useMemo(() => {
    // Ensure currentUser is available before filtering
    if (!currentUser) return [];

    return transactions
      .filter(tx => statusFilter === "all" || tx.status === statusFilter)
      .filter(tx => typeFilter === "all" || tx.type === typeFilter)
      .filter(tx =>
        (tx.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.currency || "").toLowerCase().includes(searchTerm.toLowerCase()) || // Search by currency
        (tx.recipientUsername && tx.recipientUsername.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by recipient username
        (tx.senderIdentifier && tx.senderIdentifier.toLowerCase().includes(searchTerm.toLowerCase())) // Search by sender identifier for requests
      )
      .map(tx => ({
        ...tx,
        // Determine actual display type and amount sign based on current user
        displayType: getDisplayType(tx, currentUser._id),
        displayAmount: getDisplayAmount(tx, currentUser._id),
      }));
  }, [transactions, searchTerm, statusFilter, typeFilter, currentUser]);


  const getStatusClass = (status) => `status-${status.toLowerCase()}`;
  const getAmountClass = (type) => {
    if (type === 'deposit') return 'credit';
    if (type === 'withdraw') return 'debit';
    // For send/request, the class depends on who is the sender/recipient
    // This logic will be handled by `getDisplayAmount` for the sign, and we can apply a neutral class or based on the effective flow
    return ''; 
  };

  if (loading) return <div className="text-white text-center p-5">Loading Transactions...</div>;
  if (error) return <div className="text-danger text-center p-5">{error}</div>;

  if (!currentUser) return <div className="text-white text-center p-5">User data not available.</div>;

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
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdrawal</option>
            <option value="send">Send</option>
            <option value="request">Request</option>
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
                  <td className="ticket-category">{tx.displayType}</td>
                  <td className="ticket-title">
                    {tx.type === 'send' && (tx.recipientUsername || tx.recipientEmail) ? `Sent to ${tx.recipientUsername || tx.recipientEmail}` : ''}
                    {tx.type === 'request' && tx.senderIdentifier ? `Request from ${tx.senderIdentifier}` : ''}
                    {tx.type === 'deposit' ? 'Deposit' : ''}
                    {tx.type === 'withdraw' ? 'Withdrawal' : ''}
                  </td>
                  <td>
                    <span className={`list-item-amount ${getAmountClass(tx.displayType)}`}>
                      {tx.displayAmount}
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