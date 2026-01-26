import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import PrivateRoute from './PrivateRoute';

// Pages - We'll create these next
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';
import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import TaskList from '../pages/tasks/TaskList';
import TaskDetail from '../pages/tasks/TaskDetail';
import TaskCreate from '../pages/tasks/TaskCreate';
import TaskEdit from '../pages/tasks/TaskEdit';
import MyTasks from '../pages/tasks/MyTasks';
import Profile from '../pages/profile/Profile';
import Messages from '../pages/messages/Messages';
import Notifications from '../pages/notifications/Notifications';
import HowItWorks from '../pages/HowItWorks';
import ForYou from '../pages/ForYou';
import Wallet from '../pages/payments/Wallet';
import Transactions from '../pages/payments/Transactions';
import StripeOnboarding from '../pages/payments/StripeOnboarding';
import PrivacyPolicy from '../pages/legal/PrivacyPolicy';
import TermsOfService from '../pages/legal/TermsOfService';
import NotFound from '../pages/NotFound';
import UserProfile from '../pages/users/UserProfile';
import FreelancerDirectory from '../pages/users/FreelancerDirectory';
import ContactUs from '../pages/ContactUs';
import FAQ from '../pages/FAQ';
import AboutUs from '../pages/AboutUs';
import SavedTasks from '../pages/tasks/SavedTasks';
import ServerError from '../pages/ServerError';
import Maintenance from '../pages/Maintenance';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Categories */}
      <Route path="/categories" element={<Layout><Categories /></Layout>} />

      {/* How it Works */}
      <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />

      {/* Legal Pages */}
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/terms" element={<Layout><TermsOfService /></Layout>} />

      {/* Info Pages */}
      <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
      <Route path="/faq" element={<Layout><FAQ /></Layout>} />
      <Route path="/about" element={<Layout><AboutUs /></Layout>} />

      {/* User Profiles */}
      <Route path="/freelancers" element={<Layout><FreelancerDirectory /></Layout>} />
      <Route path="/users/:username" element={<Layout><UserProfile /></Layout>} />

      {/* Task Routes */}
      <Route path="/tasks" element={<Layout><TaskList /></Layout>} />

      {/* Protected Routes */}
      <Route
        path="/tasks/:id/edit"
        element={
          <PrivateRoute>
            <Layout><TaskEdit /></Layout>
          </PrivateRoute>
        }
      />

      <Route path="/tasks/:id" element={<Layout><TaskDetail /></Layout>} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tasks/create"
        element={
          <PrivateRoute>
            <Layout><TaskCreate /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/my-tasks"
        element={
          <PrivateRoute>
            <Layout><MyTasks /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/saved-tasks"
        element={
          <PrivateRoute>
            <Layout><SavedTasks /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout><Profile /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <Layout><Messages /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Layout><Notifications /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <PrivateRoute>
            <Layout><ForYou /></Layout>
          </PrivateRoute>
        }
      />

      {/* Payment Routes */}
      <Route
        path="/wallet"
        element={
          <PrivateRoute>
            <Layout><Wallet /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <PrivateRoute>
            <Layout><Transactions /></Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/payments/onboarding"
        element={
          <PrivateRoute>
            <Layout><StripeOnboarding /></Layout>
          </PrivateRoute>
        }
      />

      {/* Error Pages */}
      <Route path="/500" element={<ServerError />} />
      <Route path="/maintenance" element={<Maintenance />} />

      {/* 404 */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

export default AppRoutes;