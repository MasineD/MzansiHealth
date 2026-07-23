import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

// Component imports
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import NotFound from './components/NotFound';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

// ===== CHANGE 1: Helper functions for localStorage management =====
const USER_STORAGE_KEY = 'user';
const SESSION_TIMESTAMP_KEY = 'session_timestamp';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

const getCachedUser = () => {
  try {
    const cached = localStorage.getItem(USER_STORAGE_KEY);
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      // Check if session is still valid based on timestamp
      const sessionAge = Date.now() - parseInt(timestamp, 10);
      if (sessionAge < SESSION_DURATION) {
        const parsedUser = JSON.parse(cached);
        if (parsedUser && parsedUser.id && parsedUser.role) {
          return parsedUser;
        }
      } else {
        // Session expired - clear storage
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      }
    }
  } catch (e) {
    console.error('Failed to parse cached user:', e);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
  }
  return null;
};

const setCachedUser = (userData) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.error('Failed to cache user data:', e);
  }
};

const clearCachedUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(SESSION_TIMESTAMP_KEY);
};

// ===== CHANGE 2: Protected Route Component =====
const ProtectedRoute = ({ user, children, redirectTo = "/" }) => {
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

const App = () => {
  // ===== CHANGE 3: Initialize state from localStorage =====
  const [user, setUser] = useState(getCachedUser);
  const [loading, setLoading] = useState(!user); // Don't show loading if we have cached user
  const [isVerifying, setIsVerifying] = useState(false);

  // ===== CHANGE 4: Session verification with caching strategy =====
  const verifySession = useCallback(async () => {
    // If we're already verifying, don't start another verification
    if (isVerifying) return;
    
    setIsVerifying(true);
    
    try {
      const res = await axios.get('/api/auth/current');
      const freshUserData = res.data.user;
      
      // Update user with fresh data from server
      setUser(freshUserData);
      setCachedUser(freshUserData);
    } catch (err) {
      console.error('Session verification failed:', err);
      
      // Only clear session if we get a 401/403 response
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setUser(null);
        clearCachedUser();
      } else {
        // For network errors, keep the cached user if available
        if (!user) {
          setUser(null);
          clearCachedUser();
        }
      }
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  }, [user, isVerifying]);

  // ===== CHANGE 5: Verify session on mount =====
  useEffect(() => {
    // Always verify session with server, even if we have cached user
    verifySession();
  }, [verifySession]);

  // ===== CHANGE 6: Custom setUser function that updates cache =====
  const handleSetUser = useCallback((newUser) => {
    setUser(newUser);
    if (newUser) {
      setCachedUser(newUser);
    } else {
      clearCachedUser();
    }
  }, []);

  // ===== CHANGE 7: Loading state =====
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ===== CHANGE 8: Home route with proper redirect ===== */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Home setUser={handleSetUser} />
          } 
        />
        
        {/* ===== CHANGE 9: Dashboard route with protection ===== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} setUser={handleSetUser} />
            </ProtectedRoute>
          } 
        />
        
        {/* ===== CHANGE 10: Catch-all route ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
