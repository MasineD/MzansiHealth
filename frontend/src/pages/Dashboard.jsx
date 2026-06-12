// ============= Dashboard Component with Logout Functionality =============
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, setUser }) => {
    const navigate = useNavigate();
    // Function to handle logout, which will involve making a request to the backend to destroy the session or token, and then updating the state accordingly, will go here
  const handleLogout = async () => {
        try {
          await axios.post('/api/auth/logout'); // Sending the logout request to the backend to destroy the session or token
            setUser(null); // After logging out, set the user state to null
            navigate('/login'); // Redirect to the login page after logging out
        } catch (err) {
          console.error("Failed to logout");
        }
    }
    return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.fullname}!</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Please log in to view the dashboard.</p>
      )}
    </div>
  )

}

export default Dashboard