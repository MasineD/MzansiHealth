// ================== Home Page Component with Premium Theme & High Aesthetics ==================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { FaBars, FaTimes, FaGoogle, FaEnvelope, FaLock, FaStar, FaPaperPlane, FaHeartbeat, FaShieldAlt, FaHospital, FaPhoneAlt, FaPlusCircle, FaCheckCircle,FaUser,FaIdCard,FaPhone,FaUserTag
} from 'react-icons/fa';

const Home = ({ setUser }) => {
  const navigate = useNavigate();
  
  // Navigation & UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // Widget Toggling State
  const [isRegistering, setIsRegistering] = useState(false);

  // Login Form States
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration Form States
  const [registerForm, setRegisterForm] = useState({
    fullname: '',
    identity: '',
    phone_number: '',
    email: '',
    password: '',
    role: 'admin',
    organization: '',
    facility_code: '',
    staff_number: '',
    profession: ''
  });
  const [organizations, setOrganizations] = useState([]);
  const [registerError, setRegisterError] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get('/api/auth/organizations');
      setOrganizations(res.data.organizations || []);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Contact Form States
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState(null);

  // Guest Appointment Form States
  const [appointmentForm, setAppointmentForm] = useState({
    fullname: '',
    organization: '',
    care_giver: '',
    reason: '',
    date: '',
    time: '',
    contact_email: '',
    contact_phone: ''
  });
  const [publicCaregivers, setPublicCaregivers] = useState([]);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState(null);

  // Scroll handler for single page navigation
  const scrollToSection = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sign In submit handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!identity || !password) {
      setLoginError('Please provide ID Number and password');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await axios.post('/api/auth/login', { identity, password });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  // Registration submit handler
  const handleRegister = async (e) => {
    e.preventDefault();
    const { fullname, identity, password, phone_number, role, organization, facility_code, staff_number, profession } = registerForm;
    if (!fullname || !identity || !password || !phone_number || !role) {
      setRegisterError('Please provide all required fields');
      return;
    }
    
    // Validate identity (exactly 13 digits) to match database constraints
    if (!/^[0-9]{13}$/.test(identity)) {
      setRegisterError('Identity number must be exactly 13 digits');
      return;
    }

    // Validate phone number (exactly 10 digits) to match database constraints
    if (!/^[0-9]{10}$/.test(phone_number)) {
      setRegisterError('Phone number must be exactly 10 digits');
      return;
    }

    // Validate organization
    if (!organization || !organization.trim()) {
      setRegisterError('Organization name is required');
      return;
    }

    if (role === 'admin') {
      if (!facility_code || !facility_code.trim()) {
        setRegisterError('Facility code is required for Admins');
        return;
      }
    }

    if (role === 'staff') {
      if (!staff_number || !staff_number.trim()) {
        setRegisterError('Staff number is required for Staff members');
        return;
      }
      if (!profession || !profession.trim()) {
        setRegisterError('Profession is required for Staff members');
        return;
      }
    }

    setRegisterLoading(true);
    setRegisterError(null);
    try {
      const res = await axios.post('/api/auth/register', registerForm);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Failed to register');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Fetch public caregivers when organization changes
  useEffect(() => {
    const fetchPublicCaregivers = async () => {
      if (!appointmentForm.organization) {
        setPublicCaregivers([]);
        return;
      }
      try {
        const res = await axios.get(`/api/appointments/public/caregivers?organization=${encodeURIComponent(appointmentForm.organization)}`);
        setPublicCaregivers(res.data.caregivers || []);
      } catch (err) {
        console.error('Failed to fetch public caregivers:', err);
        setPublicCaregivers([]);
      }
    };
    fetchPublicCaregivers();
  }, [appointmentForm.organization]);

  // Handle book appointment submission
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setAppointmentError(null);
    setAppointmentSuccess(null);

    const { fullname, organization, care_giver, reason, date, time, contact_email, contact_phone } = appointmentForm;

    if (!fullname || !fullname.trim()) {
      setAppointmentError('Please enter your full name.');
      return;
    }
    if (!organization) {
      setAppointmentError('Please select an organization.');
      return;
    }
    if (!reason || !reason.trim() || !date) {
      setAppointmentError('Please fill in all required fields (Reason and Date).');
      return;
    }

    const appointmentDateStr = date;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (appointmentDateStr < todayStr) {
      setAppointmentError('Appointment date cannot be in the past.');
      return;
    }

    if (!contact_email.trim() && !contact_phone.trim()) {
      setAppointmentError('Please provide either an email address or a phone number to receive your appointment key.');
      return;
    }

    setAppointmentLoading(true);
    try {
      const date_time = time ? `${date}T${time}` : `${date}T00:00:00`;
      const res = await axios.post('/api/appointments/public', {
        visitor_name: fullname.trim(),
        organization,
        care_giver: care_giver || null,
        reason,
        date_time,
        contact_email: contact_email.trim() || null,
        contact_phone: contact_phone.trim() || null
      });

      setAppointmentSuccess(
        `Appointment scheduled successfully! Your 6-character verification key has been sent to your provided contact info. Verification Key: ${res.data.appointment.appointment_key}`
      );
      // Reset form
      setAppointmentForm({
        fullname: '',
        organization: '',
        care_giver: '',
        reason: '',
        date: '',
        time: '',
        contact_email: '',
        contact_phone: ''
      });
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setAppointmentError(err.response?.data?.message || 'Failed to schedule appointment. Please try again.');
    } finally {
      setAppointmentLoading(false);
    }
  };

  // Contact form submit handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) {
      setContactStatus({ type: 'error', message: 'Please provide email and message.' });
      return;
    }

    setContactStatus({ type: 'info', message: 'Sending message...' });

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() || "service_jmvbt9z";
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() || "template_fqbf22j";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() || "yhO5DaRFwYK2N82yd";

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('Email configuration is missing.');
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_email: contactEmail,
          reply_to: contactEmail,
          subject: contactSubject || 'New Contact Us Message',
          message: contactMessage
        },
        publicKey
      );

      setContactStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      console.error('EmailJS Error:', err);
      setContactStatus({ 
        type: 'error', 
        message: err.text || err.message || 'Failed to send message. Please try again later.' 
      });
    } finally {
      setTimeout(() => setContactStatus(null), 6000);
    }
  };
  const displayedHospitals = organizations.length > 0 ? organizations : ['Mitchells Plain Clinic', 'Cape Town Clinic'];

  const fallbackReviews = [
    { stars: 5, text: "UbuntuHealth made it incredibly easy to consult a doctor. I received my prescription in minutes!", name: "Lindiwe Dube", profession: "Teacher" },
    { stars: 4, text: "As a Community Health Worker, the referral system has streamlined our home visits tremendously.", name: "Sibusiso Zulu", profession: "CHW Agent" },
    { stars: 5, text: "The digital patient registry keeps all my records secure and accessible wherever I go.", name: "Dr. Alan Mercer", profession: "Clinician" },
    { stars: 5, text: "Highly responsive interface. Fast support and great medical consultations locally.", name: "Naledi Molefe", profession: "Software Engineer" },
    { stars: 4, text: "Connecting clinics and hospitals under one platform is a game changer for South African health.", name: "Thabo Mofokeng", profession: "Clinic Coordinator" }
  ];

  const [dbReviews, setDbReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get('/api/reviews');
        setDbReviews(res.data.reviews || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };
    fetchReviews();
  }, []);

  const displayedReviews = dbReviews.length > 0 
    ? dbReviews.map(r => ({
        stars: r.rating,
        text: r.comment,
        organization: r.reviewer_org,
        role: r.reviewer_role
      }))
    : fallbackReviews;

  return (
    <div className='bg-[#090C0E] text-white min-h-screen font-sans overflow-x-hidden selection:bg-green-500 selection:text-black'>
      
      {/* 1. Header/Navbar */}
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
            {['home', 'about', 'service', 'appointment', 'reviews', 'contact'].map((sect) => (
              <button 
                key={sect}
                onClick={() => scrollToSection(sect)}
                className={`capitalize cursor-pointer transition-all duration-300 hover:text-green-400 ${
                  activeTab === sect ? 'text-green-500 border-b-2 border-green-500 pb-1' : 'text-gray-400'
                }`}
              >
                {sect === 'contact' ? 'Contact Us' : sect === 'appointment' ? 'Bookings' : sect}
              </button>
            ))}
          </div>

          {/* Mobile Menu */}
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
            {['home', 'about', 'service', 'appointment', 'reviews', 'contact'].map((sect) => (
              <button 
                key={sect}
                onClick={() => scrollToSection(sect)}
                className='text-left capitalize font-semibold text-lg text-gray-300 hover:text-green-500 transition-colors py-2'
              >
                {sect === 'contact' ? 'Contact Us' : sect === 'appointment' ? 'Bookings' : sect}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section id='home' className='relative min-h-screen pt-28 pb-16 px-6 md:px-12 flex items-center justify-center border-b border-white/5'>
        {/* Glow Effects */}
        <div className='absolute top-20 left-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-30 animate-pulse'></div>
        <div className='absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl opacity-20 animate-pulse delay-1000'></div>

        <div className='max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'>
          {/* Slogan Left Block */}
          <div className='lg:col-span-7 space-y-6'>
            <h1 className='text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-white'>
              Healthcare for Everyone, <br />
              <span className='text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text'>
                Everywhere
              </span>
            </h1>
            
            <p className='text-gray-400 text-lg max-w-xl font-normal leading-relaxed'>
              Providing accessible, digital healthcare across communities. Check records, consult online, and log clinic referrals securely.
            </p>

            <div className='h-px w-full max-w-lg bg-gradient-to-r from-white/10 to-transparent'></div>

            {/* Trusted By Carousel */}
            <div className='space-y-4 pt-2'>
              <h4 className='text-xs font-bold text-gray-500 tracking-widest uppercase'>Trusted By:</h4>
              <div className='relative w-full overflow-hidden mask-gradient py-2'>
                <div className={`gap-4 flex ${displayedHospitals.length <= 3 ? 'justify-start' : 'animate-scroll'}`}>
                  {/* First iteration */}
                  {displayedHospitals.map((hosp, idx) => (
                    <div key={idx} className='bg-white/5 border border-white/10 hover:border-green-500/30 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors duration-300'>
                      <FaHospital className='text-green-500 text-xs' />
                      <span>{hosp}</span>
                    </div>
                  ))}
                  {/* Duplicated for smooth loop */}
                  {displayedHospitals.length > 3 && displayedHospitals.map((hosp, idx) => (
                    <div key={`dup-${idx}`} className='bg-white/5 border border-white/10 hover:border-green-500/30 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors duration-300'>
                      <FaHospital className='text-green-500 text-xs' />
                      <span>{hosp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sign In / Register Widget Right Block */}
          <div className='lg:col-span-5 flex justify-center lg:justify-end'>
            <div className='bg-[#0D1115] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 transition-all duration-300 hover:border-green-500/20'>
              
              {!isRegistering ? (
                <>
                  <h2 className='text-2xl font-black text-center mb-6 text-white tracking-tight'>Sign In</h2>
                  
                  {loginError && (
                    <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-2 px-3 rounded-lg mb-4 text-center'>
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleSignIn} className='space-y-5'>
                    <div>
                      <label className='block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider'>ID Number</label>
                      <div className='relative'>
                        <FaEnvelope className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input 
                          type="text"
                          placeholder="Enter identity number"
                          value={identity}
                          onChange={(e) => setIdentity(e.target.value)}
                          className='w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider'>Password</label>
                      <div className='relative'>
                        <FaLock className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input 
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className='w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                        />
                      </div>
                    </div>

                    <div className='text-right'>
                      <button type="button" className='cursor-pointer text-xs text-gray-500 hover:text-green-400 transition-colors'>
                        Forgot password?
                      </button>
                    </div>

                    <button 
                      type="submit"
                      disabled={loginLoading}
                      className='cursor-pointer w-full py-3.5 bg-green-500 hover:bg-green-600 text-black font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/10 hover:scale-[1.01] active:scale-95 text-sm flex items-center justify-center gap-2'
                    >
                      {loginLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>

                  <p className='text-center text-gray-400 text-xs mt-6'>
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className='cursor-pointer text-green-400 hover:underline font-bold bg-transparent border-none p-0'
                    >
                      Sign Up
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <h2 className='text-2xl font-black text-center mb-4 text-white tracking-tight'>Register</h2>
                  
                  {/* Inline Role Selection Radio Buttons */}
                  <div className='flex justify-center items-center gap-4 text-xs text-white/95 font-semibold mb-5 bg-white/5 py-2 px-3 rounded-xl border border-white/5'>
                    <label className='flex items-center gap-1.5 cursor-pointer hover:text-green-400 transition-colors'>
                      <input 
                        type="radio" 
                        name="role" 
                        value="admin"
                        checked={registerForm.role === 'admin'}
                        onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value, organization: '', facility_code: '', staff_number: '', profession: '' })}
                        className='accent-green-500 cursor-pointer h-3.5 w-3.5'
                      />
                      <span>Admin</span>
                    </label>
                    <label className='flex items-center gap-1.5 cursor-pointer hover:text-green-400 transition-colors'>
                      <input 
                        type="radio" 
                        name="role" 
                        value="staff"
                        checked={registerForm.role === 'staff'}
                        onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value, organization: '', facility_code: '', staff_number: '', profession: '' })}
                        className='accent-green-500 cursor-pointer h-3.5 w-3.5'
                      />
                      <span>Staff</span>
                    </label>
                  </div>

                  {registerError && (
                    <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-lg mb-4 text-center'>
                      {registerError}
                    </div>
                  )}

                  <form onSubmit={handleRegister} className='space-y-4'>
                    <div>
                      <div className='relative'>
                        <FaUser className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input 
                          type="text"
                          placeholder="Full Name"
                          value={registerForm.fullname}
                          onChange={(e) => setRegisterForm({ ...registerForm, fullname: e.target.value })}
                          className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                        />
                      </div>
                    </div>

                    <div>
                      <div className='relative'>
                        <FaIdCard className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input 
                          type="text"
                          placeholder="ID or Passport Number"
                          value={registerForm.identity}
                          onChange={(e) => setRegisterForm({ ...registerForm, identity: e.target.value })}
                          className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                        />
                      </div>
                    </div>

                    <div>
                      <div className='relative'>
                        <FaPhone className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input 
                          type="text"
                          placeholder="Phone Number"
                          value={registerForm.phone_number}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone_number: e.target.value })}
                          className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                        />
                      </div>
                    </div>

                    <div>
                      <div className='relative'>
                        <FaEnvelope className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input 
                          type="email"
                          placeholder="Email (Optional)"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                        />
                      </div>
                    </div>

                    <div>
                      <div className='relative'>
                        <FaHospital className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        {registerForm.role === 'admin' ? (
                          <input 
                            type="text"
                            placeholder="Organization Name"
                            value={registerForm.organization}
                            onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                            className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                          />
                        ) : (
                          <select 
                            value={registerForm.organization}
                            onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                            className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm appearance-none cursor-pointer'
                          >
                            <option value="" disabled className="bg-[#090C0E]">Select Organization</option>
                            {organizations.length === 0 ? (
                              <option value="" disabled className="bg-[#090C0E]">No organizations available (admin must register first)</option>
                            ) : (
                              organizations.map((org, index) => (
                                <option key={index} value={org} className="bg-[#090C0E]">{org}</option>
                              ))
                            )}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Facility Code for Admin */}
                    {registerForm.role === 'admin' && (
                      <div>
                        <div className='relative'>
                          <FaUserTag className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                          <input 
                            type="text"
                            placeholder="Facility Code *"
                            value={registerForm.facility_code}
                            onChange={(e) => setRegisterForm({ ...registerForm, facility_code: e.target.value })}
                            className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Staff Number & Profession for Staff */}
                    {registerForm.role === 'staff' && (
                      <>
                        <div>
                          <div className='relative'>
                            <FaIdCard className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                            <input 
                              type="text"
                              placeholder="Staff Number *"
                              value={registerForm.staff_number}
                              onChange={(e) => setRegisterForm({ ...registerForm, staff_number: e.target.value })}
                              className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <div className='relative'>
                            <FaUserTag className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                            <select 
                              value={registerForm.profession}
                              onChange={(e) => setRegisterForm({ ...registerForm, profession: e.target.value })}
                              className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm appearance-none cursor-pointer'
                              required
                            >
                              <option value="" disabled className="bg-[#090C0E]">Select Profession *</option>
                              <option value="Doctor" className="bg-[#090C0E]">Doctor</option>
                              <option value="nurse" className="bg-[#090C0E]">nurse</option>
                              <option value="social worker" className="bg-[#090C0E]">social worker</option>
                              <option value="other" className="bg-[#090C0E]">other</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <div className='relative'>
                        <FaLock className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input 
                          type="password"
                          placeholder="Password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={registerLoading}
                      className='cursor-pointer w-full py-3 bg-green-500 hover:bg-green-600 text-black font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/10 hover:scale-[1.01] active:scale-95 text-sm flex items-center justify-center gap-2'
                    >
                      {registerLoading ? 'Registering...' : 'Register'}
                    </button>
                  </form>

                  <p className='text-center text-gray-400 text-xs mt-5'>
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className='cursor-pointer text-green-400 hover:underline font-bold bg-transparent border-none p-0'
                    >
                      Sign In
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section id='about' className='py-24 px-6 md:px-12 bg-[#0C0F11] border-b border-white/5 relative'>
        <div className='max-w-7xl mx-auto'>
          {/* Section Header */}
          <div className='text-center mb-16 space-y-2'>
            <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>About</h2>
            <p className='text-gray-400 text-sm md:text-base'>A brief summary of UbuntuHealth</p>
            <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16'>
            {/* Left Info Panel */}
            <div className='lg:col-span-7 space-y-8'>
              <div className='space-y-4'>
                <h3 className='text-2xl font-black text-green-500 uppercase tracking-wider'>Mission</h3>
                <p className='text-gray-300 leading-relaxed text-base'>
                  A mission statement about the application. Also include the vision and why people should choose UbuntuHealth. Connecting public clinics and patients through immediate digital tracking, making referrals fast, transparent, and accurate.
                </p>
              </div>

              <div className='space-y-4'>
                <h3 className='text-xl font-bold text-white uppercase tracking-wider'>Key Features</h3>
                <div className='flex flex-wrap gap-3'>
                  {['Patient Follow-up', 'Consultations', 'Referrals'].map((feat, idx) => (
                    <span key={idx} className='bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm'>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Supporting Medical Graphic SVG */}
            <div className='lg:col-span-5 flex justify-center'>
              <div className='bg-[#090C0E] border border-white/10 rounded-3xl p-8 w-full max-w-md h-80 flex flex-col items-center justify-center shadow-lg transition-transform duration-300 hover:scale-[1.02] border-dashed border-green-500/20 relative group overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                
                {/* Custom Medical SVG Icon Graphic */}
                <svg className='w-28 h-28 text-green-500 mb-4 animate-float' fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0112 3m0 0c2.917 0 5.747.294 8.5.862m-21 1.402a48.556 48.556 0 013.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                <span className='text-xs font-bold text-gray-500 uppercase tracking-widest text-center px-4'>
                  An image that supports the mission statement
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Services Section */}
      <section id='service' className='py-24 px-6 md:px-12 bg-gradient-to-r from-emerald-950 via-[#090C0E] to-teal-950 animate-gradient border-b border-white/5 relative overflow-hidden'>
        {/* Particle circles */}
        <div className='absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl opacity-50 animate-pulse'></div>
        <div className='absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl opacity-50 animate-pulse delay-500'></div>

        <div className='max-w-7xl mx-auto relative z-10'>
          {/* Section Header */}
          <div className='text-center mb-16 space-y-2'>
            <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>Services</h2>
            <p className='text-gray-400 text-sm md:text-base'>Services offered by UbuntuHealth</p>
            <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'>
            {/* Left Service Cards */}
            <div className='lg:col-span-6 space-y-4'>
              {[
                { title: 'E-Consultation', desc: 'Consult qualified clinicians online instantly from anywhere.' },
                { title: 'Prescription Delivery', desc: 'Secure, fast logistics delivering prescriptions to your door.' },
                { title: 'Community Referrals', desc: 'Track and fast-track clinical referrals via Community Health Workers.' },
                { title: 'Patient Registry Log', desc: 'Safe storage and retrieval of digital clinical patient histories.' }
              ].map((service, idx) => (
                <div key={idx} className='bg-[#090C0E]/70 backdrop-blur-md border border-white/10 hover:border-green-500/30 rounded-2xl p-5 hover:scale-[1.01] transition-all duration-300 shadow-md group'>
                  <div className='flex items-center gap-3.5 mb-2'>
                    <div className='bg-green-500/20 text-green-400 p-2 rounded-lg group-hover:bg-green-500 group-hover:text-black transition-colors duration-300'>
                      <FaHeartbeat size={16} />
                    </div>
                    <h4 className='text-lg font-bold text-white'>{service.title}</h4>
                  </div>
                  <p className='text-sm text-gray-400 pl-11'>{service.desc}</p>
                </div>
              ))}
            </div>

            {/* Right Section Description & Stats */}
            <div className='lg:col-span-6 space-y-8 lg:pl-6'>
              <div className='space-y-4'>
                <p className='text-gray-300 text-lg leading-relaxed font-normal'>
                  Our platform offers a wide range of services, including but not limited to: E-Consultation, Prescription Delivery, Community Referrals, and Patient Registry Log. The statistics below show the number of clients we have served up to so far.
                </p>
              </div>

              <div className='h-px w-full bg-white/10'></div>

              {/* Statistics Grid */}
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 text-center'>
                {[
                  { value: '10+', label: 'Hospitals' },
                  { value: '15+', label: 'Clinics' },
                  { value: '355', label: 'Health Professionals' },
                  { value: '1500+', label: 'Patients' }
                ].map((stat, idx) => (
                  <div key={idx} className='space-y-1.5'>
                    <div className='text-3xl md:text-4xl font-black text-green-500 tracking-tight'>{stat.value}</div>
                    <div className='text-xs font-bold text-gray-400 uppercase tracking-widest'>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5. Book Appointment Section */}
      <section id='appointment' className='py-24 px-6 md:px-12 bg-[#090C0E] border-b border-white/5 relative'>
        {/* Glow effects */}
        <div className='absolute top-20 right-10 w-80 h-80 bg-green-500/5 rounded-full blur-3xl opacity-20 pointer-events-none'></div>
        <div className='absolute bottom-20 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl opacity-20 pointer-events-none'></div>

        <div className='max-w-3xl mx-auto'>
          {/* Section Header */}
          <div className='text-center mb-16 space-y-2'>
            <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>Bookings</h2>
            <p className='text-gray-400 text-sm md:text-base'>Schedule an appointment as an unregistered guest</p>
            <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
          </div>

          {appointmentError && (
            <div className='border rounded-xl p-4 mb-6 text-center text-sm font-semibold flex items-center justify-center gap-2 bg-red-500/10 border-red-500/20 text-red-400 animate-in fade-in duration-300'>
              <FaTimes />
              {appointmentError}
            </div>
          )}

          {appointmentSuccess && (
            <div className='border rounded-xl p-5 mb-6 text-left text-sm font-semibold bg-green-500/10 border-green-500/20 text-green-400 flex flex-col gap-2 animate-in fade-in duration-300'>
              <div className='flex items-center gap-2 text-base font-bold'>
                <FaCheckCircle className='text-green-500 shrink-0' />
                Appointment Booked!
              </div>
              <p className='text-gray-300 font-normal leading-relaxed'>{appointmentSuccess}</p>
            </div>
          )}

          <form onSubmit={handleBookAppointment} className='space-y-6 bg-[#0D1115] border border-white/10 p-8 rounded-3xl shadow-xl'>
            {/* Full Name */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-left md:text-right'>Full Name *:</label>
              <div className='md:col-span-9'>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={appointmentForm.fullname}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, fullname: e.target.value })}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                  required
                />
              </div>
            </div>

            {/* Organization Dropdown */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-left md:text-right'>Organization *:</label>
              <div className='md:col-span-9'>
                <select
                  value={appointmentForm.organization}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, organization: e.target.value, care_giver: '' })}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                  required
                >
                  <option value="" className='bg-[#0D1115] text-gray-400'>-- Select Organization --</option>
                  {organizations.map((org, index) => (
                    <option key={index} value={org} className='bg-[#0D1115] text-white'>{org}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Caregiver Dropdown (Optional) */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-left md:text-right'>Staff Member:</label>
              <div className='md:col-span-9'>
                <select
                  value={appointmentForm.care_giver}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, care_giver: e.target.value })}
                  disabled={!appointmentForm.organization}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed'
                >
                  <option value="" className='bg-[#0D1115] text-gray-400'>-- Select Staff Member (Optional) --</option>
                  {publicCaregivers.map((cg) => (
                    <option key={cg.id} value={cg.id} className='bg-[#0D1115] text-white'>{cg.fullname}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-left md:text-right'>Reason *:</label>
              <div className='md:col-span-9'>
                <input
                  type="text"
                  placeholder="e.g. Regular medical checkup"
                  value={appointmentForm.reason}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-left md:text-right'>Date *:</label>
              <div className='md:col-span-9'>
                <input
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                  required
                />
              </div>
            </div>

            {/* Time */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-left md:text-right'>Time:</label>
              <div className='md:col-span-9'>
                <input
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                />
              </div>
            </div>

            {/* Email Contact */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-left md:text-right'>Email Address:</label>
              <div className='md:col-span-9'>
                <input
                  type="email"
                  placeholder="name@example.com (To receive key)"
                  value={appointmentForm.contact_email}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, contact_email: e.target.value })}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                />
              </div>
            </div>

            {/* Phone Contact */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-left md:text-right'>Phone Number:</label>
              <div className='md:col-span-9'>
                <input
                  type="tel"
                  placeholder="e.g. 0714366053 (To receive key)"
                  value={appointmentForm.contact_phone}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, contact_phone: e.target.value })}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <div className='md:col-span-3'></div>
              <div className='md:col-span-9 text-left'>
                <button
                  type="submit"
                  disabled={appointmentLoading}
                  className='cursor-pointer inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-600/30 text-sm disabled:opacity-50'
                >
                  {appointmentLoading ? 'Booking...' : (
                    <>
                      <FaPaperPlane />
                      <span>Book Appointment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 5. Reviews Section */}
      <section id='reviews' className='py-24 px-6 md:px-12 bg-[#0C0F11] border-b border-white/5 overflow-hidden relative'>
        <div className='max-w-7xl mx-auto'>
          {/* Section Header */}
          <div className='text-center mb-16 space-y-2'>
            <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>Reviews</h2>
            <p className='text-gray-400 text-sm md:text-base'>What users say about UbuntuHealth</p>
            <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
          </div>

          {/* Reviews Scrolling Carousel */}
          <div className='relative w-full overflow-hidden mask-gradient py-4'>
            <div className={`gap-6 flex ${displayedReviews.length <= 3 ? 'justify-center flex-wrap' : 'animate-scroll'}`}>
              {/* First loop iteration */}
              {displayedReviews.map((rev, idx) => (
                <div key={idx} className='bg-[#0D1115] border border-white/10 hover:border-green-500/20 rounded-3xl p-6 w-80 flex-shrink-0 flex flex-col justify-between transition-colors duration-300'>
                  <div>
                    {/* Stars Block */}
                    <div className='flex items-center gap-1 mb-4'>
                      {[...Array(5)].map((_, starIdx) => (
                        <FaStar 
                          key={starIdx} 
                          className={starIdx < rev.stars ? 'text-yellow-500' : 'text-gray-700'} 
                          size={14}
                        />
                      ))}
                    </div>
                    <p className='text-gray-300 text-sm leading-relaxed mb-6 italic'>"{rev.text || rev.comment}"</p>
                  </div>
                  <div>
                    <h5 className='font-bold text-white text-sm'>{rev.organization || rev.name || 'UbuntuHealth'}</h5>
                    <p className='text-xs text-green-500 font-semibold mt-0.5'>{rev.role || rev.profession}</p>
                  </div>
                </div>
              ))}
              {/* Duplicated loop iteration (only for scrolling ticker with 4+ items) */}
              {displayedReviews.length > 3 && displayedReviews.map((rev, idx) => (
                <div key={`dup-${idx}`} className='bg-[#0D1115] border border-white/10 hover:border-green-500/20 rounded-3xl p-6 w-80 flex-shrink-0 flex flex-col justify-between transition-colors duration-300'>
                  <div>
                    {/* Stars Block */}
                    <div className='flex items-center gap-1 mb-4'>
                      {[...Array(5)].map((_, starIdx) => (
                        <FaStar 
                          key={starIdx} 
                          className={starIdx < rev.stars ? 'text-yellow-500' : 'text-gray-700'} 
                          size={14}
                        />
                      ))}
                    </div>
                    <p className='text-gray-300 text-sm leading-relaxed mb-6 italic'>"{rev.text || rev.comment}"</p>
                  </div>
                  <div>
                    <h5 className='font-bold text-white text-sm'>{rev.organization || rev.name || 'UbuntuHealth'}</h5>
                    <p className='text-xs text-green-500 font-semibold mt-0.5'>{rev.role || rev.profession}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Us Section */}
      <section id='contact' className='py-24 px-6 md:px-12 bg-[#090C0E] border-b border-white/5 relative'>
        <div className='max-w-3xl mx-auto'>
          {/* Section Header */}
          <div className='text-center mb-16 space-y-2'>
            <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>Contact Us</h2>
            <p className='text-gray-400 text-sm md:text-base'>Feel free to reach out to us</p>
            <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
          </div>

          {contactStatus && (
            <div className={`border rounded-xl p-4 mb-6 text-center text-sm font-semibold flex items-center justify-center gap-2 ${
              contactStatus.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {contactStatus.type === 'success' ? <FaCheckCircle /> : <FaTimes />}
              {contactStatus.message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleContactSubmit} className='space-y-6 bg-[#0D1115] border border-white/10 p-8 rounded-3xl shadow-xl'>
            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider'>Email:</label>
              <div className='md:col-span-9'>
                <input 
                  type="email"
                  placeholder="name@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
              <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider'>Subject Line:</label>
              <div className='md:col-span-9'>
                <input 
                  type="text"
                  placeholder="Enter message subject"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Message:</label>
              <textarea 
                rows="5"
                placeholder="Type your message here..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm resize-none'
              ></textarea>
            </div>

            <div className='flex justify-end pt-2'>
              <button 
                type="submit"
                className='cursor-pointer bg-white text-black hover:bg-green-500 hover:text-black font-extrabold px-8 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 text-sm shadow-md'
              >
                <FaPaperPlane size={12} />
                SEND
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 7. Footer Section */}
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
              {['home', 'about', 'service', 'appointment', 'reviews', 'contact'].map((sect) => (
                <button 
                  key={sect}
                  onClick={() => scrollToSection(sect)}
                  className='text-left hover:text-green-500 transition-colors capitalize'
                >
                  {sect === 'contact' ? 'Contact Us' : sect === 'appointment' ? 'Book Appointment' : sect}
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
    </div>
  );
};

export default Home;