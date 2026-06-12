import React from 'react';
import { FaBars, FaTimes, FaHeartbeat } from 'react-icons/fa';

const LandingNavbar = ({ activeTab, scrollToSection, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-[#090C0E]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 transition-all duration-300'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        {/* Logo */}
        <div className='flex items-center gap-2 cursor-pointer' onClick={() => scrollToSection('home')}>
          <div className='bg-green-500 text-black p-1.5 rounded-lg font-bold flex items-center justify-center animate-pulse'>
            <FaHeartbeat size={20} />
          </div>
          <span className='text-2xl font-black tracking-tight text-white'>
            Ubuntu<span className='text-green-500'>Health</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className='hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide'>
          {['home', 'about', 'service', 'reviews', 'contact'].map((sect) => (
            <button 
              key={sect}
              onClick={() => scrollToSection(sect)}
              className={`capitalize cursor-pointer transition-all duration-300 hover:text-green-400 ${
                activeTab === sect ? 'text-green-500 border-b-2 border-green-500 pb-1' : 'text-gray-400'
              }`}
            >
              {sect === 'contact' ? 'Contact Us' : sect}
            </button>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className='md:hidden text-white/90 hover:text-green-500 transition-colors duration-300'
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-[#090C0E] border-b border-white/10 py-6 px-8 flex flex-col gap-5 shadow-2xl animate-fade-in'>
          {['home', 'about', 'service', 'reviews', 'contact'].map((sect) => (
            <button 
              key={sect}
              onClick={() => scrollToSection(sect)}
              className='text-left capitalize font-semibold text-lg text-gray-300 hover:text-green-500 transition-colors py-2'
            >
              {sect === 'contact' ? 'Contact Us' : sect}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
