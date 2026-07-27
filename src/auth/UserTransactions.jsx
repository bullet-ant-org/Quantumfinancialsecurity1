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

  if (loading) return <div className="tx-page-status">Loading transactions\u2026</div>;
  if (error) return <div className="tx-page-status error">{error}</div>;

  if (!currentUser) return <div className="tx-page-status">User data not available.</div>;

  return (
    <>
      <div className="tx-page">
        <h1 className="tx-page__title">Transaction history</h1>
        <p className="tx-page__subtitle">Every deposit, withdrawal, send, and request on your account.</p>

        <div className="tx-filters">
          <div className="tx-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search by description, type, or currency"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="tx-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select className="tx-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdrawal</option>
            <option value="send">Send</option>
            <option value="request">Request</option>
          </select>
        </div>

        <div className="tx-table-card">
          <table className="tx-table">
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
                <tr key={tx._id} onClick={() => setSelectedTransaction(tx)} className="tx-row">
                  <td className="tx-row__date">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="tx-row__type">{tx.displayType}</td>
                  <td className="tx-row__desc">
                    {tx.type === 'send' && (tx.recipientUsername || tx.recipientEmail) ? `Sent to ${tx.recipientUsername || tx.recipientEmail}` : ''}
                    {tx.type === 'request' && tx.senderIdentifier ? `Request from ${tx.senderIdentifier}` : ''}
                    {tx.type === 'deposit' ? 'Deposit' : ''}
                    {tx.type === 'withdraw' ? 'Withdrawal' : ''}
                  </td>
                  <td>
                    <span className={`tx-amount ${getAmountClass(tx.displayType)}`}>
                      {tx.displayAmount}
                    </span>
                  </td>
                  <td>
                    <span className={`tx-status ${getStatusClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="tx-empty-row">No transactions found.</td>
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