import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import Logo from '../assets/qfswhite.png';

const Sidebar = ({ isOpen, userType, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  const adminLinks = [
    { path: '/admin/dashboard', name: 'Overview', icon: 'dashboard' },
    { path: '/admin/users', name: 'User Management', icon: 'group' },
    { path: '/admin/portfolios', name: 'Portfolios', icon: 'work' },
    { path: '/admin/secretphrases', name: 'Secret Phrases', icon: 'key' },
    { path: '/admin/tickets', name: 'Support Tickets', icon: 'receipt_long' },
    { path: '/admin/disputes', name: 'Disputes', icon: 'gavel' },
    { path: '/admin/notifications', name: 'Notifications', icon: 'notifications' },
    { path: '/admin/send-notification', name: 'Send Notification', icon: 'send' },
    { path: '/admin/profile', name: 'Profile', icon: 'person' },
  ];

  const userLinks = [
    { path: '/user/dashboard', name: 'Dashboard', icon: 'dashboard' },
    { path: '/user/connect-wallet', name: 'Connect Wallet', icon: 'account_balance_wallet' },
    { path: '/user/transactions', name: 'Transactions', icon: 'swap_vert' },
    { path: '/user/assets', name: 'Assets', icon: 'pie_chart' },
    { path: '/user/send', name: 'Send', icon: 'send' },
    { path: '/user/request', name: 'Request', icon: 'call_received' },
    { path: '/user/cards', name: 'Cards', icon: 'credit_card' },
    { path: '/user/notifications', name: 'Notifications', icon: 'notifications' },
    { path: '/user/profile', name: 'Profile', icon: 'person' },
    { path: '/user/create-ticket', name: 'Create Ticket', icon: 'note_add' },
    { path: '/user/create-dispute', name: 'File a Dispute', icon: 'report_problem' },
    { path: '/user/disputes', name: 'My Disputes', icon: 'shield' },
  ];

  const links = userType === 'admin' ? adminLinks : userLinks;

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="mobile-close-button" onClick={toggleSidebar}>
        <span className="material-symbols-outlined">close</span>
      </button>
      <div className="sidebar-header">
        <img src={Logo} alt="QFS Logo" className="sidebar-logo" />

      </div>
      <ul className="nav flex-column">
        {links.map(link => (
          <li className="nav-item" key={link.name}>
            <NavLink className="nav-link" to={link.path} title={link.name} onClick={handleLinkClick}>
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="link-text">{link.name}</span>
            </NavLink>
          </li>))}
      </ul>
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="user-avatar">
            <span className="material-symbols-outlined">account_circle</span>
          </div>
          <div className="user-details link-text">
            <div className="footer-username">{user?.username || 'User'}</div>
            <div className="footer-email">{user?.email || 'email@example.com'}</div>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout} title="Logout">
          <span className="material-symbols-outlined">logout</span>
          <span className="link-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;