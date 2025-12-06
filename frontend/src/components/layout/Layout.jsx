import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from '../chatbot/Chatbot';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {isAuthenticated && <Chatbot position="bottom-right" />}
    </div>
  );
};

export default Layout;