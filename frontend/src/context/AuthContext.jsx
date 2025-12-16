import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load user from API on mount (not just localStorage)
    const loadUser = async () => {
      try {
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          // Fetch fresh user data from API instead of localStorage
          try {
            const userData = await authService.getProfile();
            setUser(userData);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // Fallback to localStorage if API fails
            const cachedUser = authService.getCurrentUser();
            if (cachedUser) {
              setUser(cachedUser);
            } else {
              // If both fail, clear auth
              setIsAuthenticated(false);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      setLoading(true);
      const data = await authService.login(usernameOrEmail, password);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      return data;
    } catch (error) {
      const message = error.response?.data?.non_field_errors?.[0] || 
                     error.response?.data?.detail || 
                     'Invalid credentials';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const data = await authService.register(userData);
      setUser(data.user);
      setIsAuthenticated(true);
      toast.success('Registration successful! Welcome to Multitask!');
      return data;
    } catch (error) {
      const message = error.response?.data?.username?.[0] || 
                     error.response?.data?.email?.[0] || 
                     'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const userData = await authService.updateProfile(profileData);
      // Merge with existing user data to preserve all fields
      setUser(prevUser => ({
        ...prevUser,
        ...userData
      }));
      toast.success('Profile updated successfully');
      return userData;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    isClient: user?.is_client || false,
    isFreelancer: user?.is_freelancer || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};