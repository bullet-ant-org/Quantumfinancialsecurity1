import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Sidebar.css';
import LogoDark from '../assets/qfswhite.png';
import LogoLight from '../assets/qfs.png';

const Sidebar = ({ isOpen, userType, toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

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
    { path: '/admin/dashboard', name: 'Overview', icon: 'dashboard', description: 'System stats' },
    { path: '/admin/users', name: 'User Management', icon: 'group', description: 'Manage users' },
    { path: '/admin/portfolios', name: 'Portfolios', icon: 'work', description: 'View holdings' },
    { path: '/admin/secretphrases', name: 'Secret Phrases', icon: 'key', description: 'User secrets' },
    { path: '/admin/tickets', name: 'Support Tickets', icon: 'receipt_long', description: 'Help requests' },
    { path: '/admin/disputes', name: 'Disputes', icon: 'gavel', description: 'Resolve issues' },
    { path: '/admin/notifications', name: 'Notifications', icon: 'notifications', description: 'System alerts' },
    { path: '/admin/send-notification', name: 'Send Notification', icon: 'send', description: 'Broadcast msg' },
    { path: '/admin/profile', name: 'Profile', icon: 'person', description: 'Admin account' },
  ];

  const userLinks = [
    { path: '/user/dashboard', name: 'Dashboard', icon: 'dashboard', description: 'Overview' },
    { path: '/user/connect-wallet', name: 'Connect Wallet', icon: 'account_balance_wallet', description: 'Link wallet' },
    { path: '/user/transactions', name: 'Transactions', icon: 'swap_vert', description: 'Transfer history' },
    { path: '/user/assets', name: 'Assets', icon: 'pie_chart', description: 'Portfolio view' },
    { path: '/user/send', name: 'Send', icon: 'send', description: 'Transfer funds' },
    { path: '/user/request', name: 'Request', icon: 'call_received', description: 'Receive funds' },
    { path: '/user/cards', name: 'Cards', icon: 'credit_card', description: 'Card services' },
    { path: '/user/notifications', name: 'Notifications', icon: 'notifications', description: 'Alerts' },
    { path: '/user/profile', name: 'Profile', icon: 'person', description: 'Account settings' },
    { path: '/user/create-ticket', name: 'Create Ticket', icon: 'note_add', description: 'Get support' },
    { path: '/user/create-dispute', name: 'File a Dispute', icon: 'report_problem', description: 'Report issue' },
    { path: '/user/disputes', name: 'My Disputes', icon: 'shield', description: 'Track issues' },
  ];

  const links = userType === 'admin' ? adminLinks : userLinks;

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="mobile-close-button" onClick={toggleSidebar}>
        <span className="material-symbols-outlined">close</span>
      </button>
      <div className="sidebar-header">
        <img src={isDarkMode ? LogoDark : LogoLight} alt="QFS Logo" className="sidebar-logo" />

      </div>
      <ul className="nav flex-column">
        {links.map(link => (
          <li className="nav-item" key={link.name}>
            <NavLink className="nav-link" to={link.path} title={link.name} onClick={handleLinkClick}>
              <span className="material-symbols-outlined">{link.icon}</span>
              <div className="link-content">
                <span className="link-text">{link.name}</span>
                <span className="link-description">{link.description}</span>
              </div>
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
