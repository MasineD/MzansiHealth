// ================ Navigation Bar Component ================
import React from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-green-500 p-4 text-white">
      <Link to="/login">Get Started</Link>
    </nav>
  )
}

export default Navbar