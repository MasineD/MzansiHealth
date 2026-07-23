import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Fixed import
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NotFound from './components/NotFound';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

// ===== CHANGE 1: Created ProtectedRoute component for better route protection =====
const ProtectedRoute = ({ user, children, redirectTo = "/" }) => {
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const res = await axios.get('/api/auth/current');
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
        console.log("Failed to fetch user session");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ===== CHANGE 2: Home route with proper redirect ===== */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Home setUser={setUser} />
          } 
        />
        
        {/* ===== CHANGE 3: Dashboard route is ALWAYS defined, but protected ===== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          } 
        />
        
        {/* ===== CHANGE 4: Catch-all route remains at the bottom ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
