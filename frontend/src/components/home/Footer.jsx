import React from 'react';
import { FaHeartbeat, FaPhoneAlt, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

const Footer = ({ scrollToSection }) => {
  return (
    <footer className='bg-[#060809] border-t border-white/5 py-12 px-6 md:px-12 text-sm text-gray-500'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12'>
        
        {/* Logo & Description */}
        <div className='md:col-span-5 space-y-4'>
          <div className='flex items-center gap-2'>
            <div className='bg-green-500 text-black p-1.5 rounded-lg font-bold flex items-center justify-center'>
              <FaHeartbeat size={16} />
            </div>
            <span className='text-lg font-black tracking-tight text-white'>
              Ubuntu<span className='text-green-500'>Health</span>
            </span>
          </div>
          <p className='text-gray-400 text-xs leading-relaxed max-w-sm'>
            Democratizing health management across communities in South Africa. Empowering patients, clinicians, and health workers with instant, secure clinical data mapping.
          </p>
        </div>

        {/* Quick Links */}
        <div className='md:col-span-3 space-y-3'>
          <h5 className='text-white text-xs font-bold uppercase tracking-wider'>Quick Links</h5>
          <div className='flex flex-col gap-2 text-xs'>
            {['home', 'about', 'service', 'reviews', 'contact'].map((sect) => (
              <button 
                key={sect}
                onClick={() => scrollToSection(sect)}
                className='text-left hover:text-green-500 transition-colors capitalize'
              >
                {sect === 'contact' ? 'Contact Us' : sect}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className='md:col-span-4 space-y-3'>
          <h5 className='text-white text-xs font-bold uppercase tracking-wider'>Emergency & Support</h5>
          <div className='space-y-2 text-xs text-gray-400'>
            <p className='flex items-center gap-2'>
              <FaPhoneAlt className='text-green-500' /> Emergency Toll-Free: 0800 111 911
            </p>
            <p className='flex items-center gap-2'>
              <FaEnvelope className='text-green-500' /> support@ubuntuhealth.org.za
            </p>
            <p className='flex items-center gap-2'>
              <FaShieldAlt className='text-green-500' /> Secure Data Compliant (POPIA)
            </p>
          </div>
        </div>
      </div>

      {/* Footer Divider & Legal Row */}
      <div className='max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs'>
        <p>© 2026 UbuntuHealth. All rights reserved.</p>
        <div className='flex gap-6 font-semibold text-gray-400'>
          <button className='hover:text-green-500 transition-colors cursor-pointer'>Privacy Policy</button>
          <button className='hover:text-green-500 transition-colors cursor-pointer'>Terms of Use</button>
          <button className='hover:text-green-500 transition-colors cursor-pointer'>POPIA Compliance</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
