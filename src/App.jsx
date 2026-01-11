import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Footer from './components/Footer';
import Auth from './auth/Auth';
import DashboardLayout from './auth/DashboardLayout';
import AdminDashboard from './auth/AdminDashboard';
import UserDashboard from './auth/UserDashboard';
import UserManagement from './auth/UserManagement';
import Portfolios from './auth/Portfolios';
import Tickets from './auth/Tickets';
import Profile from './auth/Profile';
import SecretPhrases from './auth/SecretPhrases';
import Disputes from './auth/Disputes';
import ConnectWallet from './auth/ConnectWallet';
import UserTransactions from './auth/UserTransactions';
import UserAssets from './auth/UserAssets';
import UserProfile from './auth/UserProfile';
import CreateTicket from './auth/CreateTicket';
import CreateDispute from './auth/CreateDispute';
import UserDisputes from './auth/UserDisputes';
import CardPage from './pages/Cards';
import NotificationsPage from './pages/Notifications';
import AdminNotifications from './auth/AdminNotifications';

import UserRequest from './pages/UserRequest';
import UserSend from './pages/UserSend';

const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [{ index: true, element: <Landing /> }]
  },
  {
    path: "/login",
    element: <Auth />
  },
  {
    path: "/admin",
    element: <DashboardLayout userType="admin" />,
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "portfolios", element: <Portfolios /> },
      { path: "tickets", element: <Tickets /> },
      { path: "profile", element: <Profile />},
      { path: "secretphrases", element: <SecretPhrases /> },
      { path: "disputes", element: <Disputes /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "send-notification", element: <AdminNotifications /> }
    ]
  },
  {
    path: "/user",
    element: <DashboardLayout userType="user" />,
    children: [
      { path: "dashboard", element: <UserDashboard /> },
      { path: "connect-wallet", element: <ConnectWallet /> },
      { path: "transactions", element: <UserTransactions /> },
      { path: "assets", element: <UserAssets /> },
      { path: "profile", element: <UserProfile /> },
      { path: "send", element: <UserSend /> },
      { path: "request", element: <UserRequest /> },
      { path: "cards", element: <CardPage /> },
      { path: "create-ticket", element: <CreateTicket /> },
      { path: "create-dispute", element: <CreateDispute /> },
      { path: "disputes", element: <UserDisputes /> },
      { path: "notifications", element: <NotificationsPage /> }
    ]
  }
]);

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App
