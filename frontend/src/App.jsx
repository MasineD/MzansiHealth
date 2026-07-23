import React,{ useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router';
import Navbar from './components/Navbar';
import Home from './pages/Home';

import Dashboard from './pages/Dashboard';
import NotFound from './components/NotFound';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // Target the backend server
axios.defaults.withCredentials = true; // This will allow axios to send cookies with requests, which is necessary for session management
const App = () => {
  const [user, setUser] = useState(null);
  // const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Managing user sessions, by making requests to the backend to check if the user is logged in, and updating the state accordingly, will go here

  useEffect(() => {
    // Check if the user is logged in by making a request to the backend, and update the state accordingly
    const fetchUserSession = async () => {
      try {
        // Make a request to the backend to check for a valid session or token
        const res = await axios.get('/api/auth/current'); // Getting the logged in user from the backend
        setUser(res.data.user); // If the session is valid, set the user state to the user data returned from the backend
      } catch (err) {
        setUser(null);
        // setError("Failed to check user session");
      }
      finally {
        setLoading(false); // Set loading to false after checking the session
      }
    };

    fetchUserSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking the session
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} setUser={setUser} /> : <Home setUser={setUser} />} />
        { user && <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />}/> } {/* Only render the dashboard route if the user is logged in */ }
        <Route path="*" element={<NotFound />} /> {/* A catch-all route for undefined paths */ }
      </Routes>
    </BrowserRouter>
  )
}

export default App
