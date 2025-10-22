import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import './Dashboard.css';

const DashboardLayout = ({ userType }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} userType={userType} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <DashboardNavbar toggleSidebar={toggleSidebar} />
        <div className="content-area"><Outlet /></div>
      </div>
    </div>
  );
};

export default DashboardLayout;