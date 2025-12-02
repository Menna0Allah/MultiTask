import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import PrivateRoute from './PrivateRoute';

// Pages - We'll create these next
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import TaskList from '../pages/tasks/TaskList';
import TaskDetail from '../pages/tasks/TaskDetail';
import TaskCreate from '../pages/tasks/TaskCreate';
import MyTasks from '../pages/tasks/MyTasks';
import Profile from '../pages/profile/Profile';
import Messages from '../pages/messages/Messages';
import HowItWorks from '../pages/HowItWorks';
import NotFound from '../pages/NotFound';

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

      {/* Categories */}
      <Route path="/categories" element={<Layout><Categories /></Layout>} />

      {/* How it Works */}
      <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />

      {/* Task Routes */}
      <Route path="/tasks" element={<Layout><TaskList /></Layout>} />
      <Route path="/tasks/:id" element={<Layout><TaskDetail /></Layout>} />

      {/* Protected Routes */}
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
          <PrivateRoute requireClient>
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

      {/* 404 */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

export default AppRoutes;