// ============= Dashboard Component with Role-Based Views and Premium Aesthetics =============
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  FaUserMd, 
  FaUser, 
  FaUsers, 
  FaCalendarAlt, 
  FaPrescriptionBottle, 
  FaClipboardList, 
  FaPlus, 
  FaHeartbeat, 
  FaRunning, 
  FaTint, 
  FaSignOutAlt, 
  FaMedkit, 
  FaFileMedicalAlt, 
  FaTasks,
  FaExchangeAlt,
  FaStar,
  FaComments,
  FaClock,
  FaHospital,
  FaShieldAlt,
  FaPlusCircle,
  FaPaperPlane
} from 'react-icons/fa';

// --- Staff Dashboard Component ---
const StaffDashboard = ({ user, handleLogout }) => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'patients', label: 'Patients', icon: <FaUsers /> },
    { id: 'prescriptions', label: 'E-Prescriptions', icon: <FaPrescriptionBottle /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'telehealth', label: 'Telehealth', icon: <FaHeartbeat /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
  ];

  return (
    <div className='min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      {/* Sidebar */}
      <aside className='w-full md:w-64 bg-[#090b0d] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 shrink-0 relative z-20 justify-between'>
        <div>
          {/* Logo / Brand */}
          <div className='flex items-center gap-2 mb-8'>
            <div className='bg-emerald-500 text-black p-1.5 rounded-lg font-bold flex items-center justify-center'>
              <FaHeartbeat size={18} />
            </div>
            <span className='text-lg font-black tracking-tight text-white'>
              Ubuntu<span className='text-emerald-500'>Health</span>
            </span>
          </div>

          {/* Clinician Portal Tag */}
          <div className='bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase mb-6 flex items-center gap-2'>
            <FaUserMd />
            <span>Clinician Portal</span>
          </div>

          {/* Navigation Links */}
          <nav className='space-y-1.5'>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' 
                    : 'bg-white/5 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout at Bottom */}
        <button 
          onClick={handleLogout} 
          className='cursor-pointer flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 px-5 py-3 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-95 mt-8 text-gray-400 hover:text-red-400'
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-6 md:p-12 overflow-y-auto relative z-10'>
        {activeTab === 'overview' ? (
          <div className='max-w-6xl mx-auto'>
            {/* Header */}
            <header className='mb-12 pb-6 border-b border-emerald-500/20'>
              <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, Dr. {user.fullname}</h1>
              <p className='text-gray-400 text-sm mt-1'>Org: {user.organization}</p>
            </header>

            {/* Quick Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
              {[
                { label: 'Active Patients', value: '142', icon: <FaUsers className='text-emerald-400' />, desc: '+12 this week' },
                { label: "Today's Appointments", value: '8', icon: <FaCalendarAlt className='text-teal-400' />, desc: '3 completed' },
                { label: 'Pending Prescriptions', value: '3', icon: <FaPrescriptionBottle className='text-cyan-400' />, desc: 'Requires signature' },
                { label: 'Consultations Left', value: '5', icon: <FaClipboardList className='text-blue-400' />, desc: 'Next at 2:00 PM' }
              ].map((stat, idx) => (
                <div key={idx} className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-300'>
                  <div className='flex justify-between items-start mb-4'>
                    <span className='text-gray-400 text-sm font-medium'>{stat.label}</span>
                    <div className='bg-white/5 p-2 rounded-lg'>{stat.icon}</div>
                  </div>
                  <div className='text-3xl font-bold mb-1'>{stat.value}</div>
                  <span className='text-xs text-gray-500'>{stat.desc}</span>
                </div>
              ))}
            </div>

            {/* Dashboard Sections */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Area: Patient List */}
              <div className='lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-xl font-bold flex items-center gap-2'>
                    <FaClipboardList className='text-emerald-400' />
                    Recent Consultations
                  </h2>
                  <button className='cursor-pointer flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-black'>
                    <FaPlus size={10} /> Add Record
                  </button>
                </div>
                
                <div className='space-y-4'>
                  {[
                    { name: 'Sipho Nkosi', condition: 'Hypertension Follow-up', time: '10:30 AM', status: 'Completed' },
                    { name: 'Mary van der Merwe', condition: 'Diabetes Review', time: '11:15 AM', status: 'Completed' },
                    { name: 'Kabelo Mokoena', condition: 'Acute Bronchitis', time: '12:00 PM', status: 'In Progress' },
                    { name: 'Zama Dlamini', condition: 'General Checkup', time: '02:00 PM', status: 'Upcoming' }
                  ].map((patient, idx) => (
                    <div key={idx} className='flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300'>
                      <div>
                        <h3 className='font-semibold'>{patient.name}</h3>
                        <p className='text-xs text-gray-400'>{patient.condition}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium mb-1'>{patient.time}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          patient.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          patient.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-white/5 text-gray-400 border border-white/10'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Area: Tools & Alerts */}
              <div className='space-y-6'>
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                  <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                    <FaMedkit className='text-teal-400' />
                    Clinical Utilities
                  </h2>
                  <div className='space-y-3'>
                    {['Write E-Prescription', 'Access Medical Registry', 'Integrate Lab Results', 'Telehealth Dashboard'].map((tool, idx) => (
                      <button key={idx} className='cursor-pointer w-full text-left bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/20 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]'>
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'appointments' ? (
          <AppointmentsSection user={user} />
        ) : activeTab === 'referrals' ? (
          <ReferralsSection user={user} />
        ) : activeTab === 'reviews' ? (
          <ReviewsSection user={user} />
        ) : (
          <div className='max-w-4xl mx-auto text-center py-20 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl'>
            <FaUserMd size={60} className='mx-auto mb-4 text-emerald-400 animate-pulse' />
            <h2 className='text-2xl font-bold mb-2 capitalize'>{activeTab} Section</h2>
            <p className='text-gray-400 text-sm max-w-md mx-auto'>
              The features for the staff dashboard's {activeTab} tab will be fully implemented according to subsequent instructions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Patient Dashboard Component ---
const PatientDashboard = ({ user, handleLogout }) => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FaPrescriptionBottle /> },
    { id: 'registry', label: 'Medical Registry', icon: <FaFileMedicalAlt /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
  ];

  return (
    <div className='min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      {/* Sidebar */}
      <aside className='w-full md:w-64 bg-[#090b0d] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 shrink-0 relative z-20 justify-between'>
        <div>
          {/* Logo / Brand */}
          <div className='flex items-center gap-2 mb-8'>
            <div className='bg-purple-500 text-black p-1.5 rounded-lg font-bold flex items-center justify-center'>
              <FaHeartbeat size={18} />
            </div>
            <span className='text-lg font-black tracking-tight text-white'>
              Ubuntu<span className='text-purple-500'>Health</span>
            </span>
          </div>

          {/* Patient Portal Tag */}
          <div className='bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase mb-6 flex items-center gap-2'>
            <FaUser />
            <span>Patient Portal</span>
          </div>

          {/* Navigation Links */}
          <nav className='space-y-1.5'>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-purple-500 text-black shadow-lg shadow-purple-500/10' 
                    : 'bg-white/5 hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 border border-transparent hover:border-purple-500/20'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout at Bottom */}
        <button 
          onClick={handleLogout} 
          className='cursor-pointer flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 px-5 py-3 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-95 mt-8 text-gray-400 hover:text-red-400'
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-6 md:p-12 overflow-y-auto relative z-10'>
        {activeTab === 'overview' ? (
          <div className='max-w-6xl mx-auto'>
            {/* Header */}
            <header className='mb-12 pb-6 border-b border-purple-500/20'>
              <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Hello, {user.fullname}</h1>
              <p className='text-gray-400 text-sm mt-1'>Identity: {user.identity?.trim()}</p>
              <p className='text-gray-400 text-sm mt-1'>Organization: {user.organization?.trim()}</p>
            </header>

            {/* Health Metrics & Trackers */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
              {[
                { label: 'Heart Rate', value: '72 bpm', icon: <FaHeartbeat className='text-red-400 animate-pulse' />, desc: 'Normal range' },
                { label: 'Activity Today', value: '8,450 steps', icon: <FaRunning className='text-indigo-400' />, desc: 'Goal: 10,000 steps' },
                { label: 'Water Intake', value: '1.8 Liters', icon: <FaTint className='text-blue-400' />, desc: 'Goal: 2.5 Liters' },
                { label: 'Active Prescriptions', value: '2 Drugs', icon: <FaPrescriptionBottle className='text-purple-400' />, desc: 'Next dose at 8:00 PM' }
              ].map((stat, idx) => (
                <div key={idx} className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 hover:scale-[1.02] transition-all duration-300'>
                  <div className='flex justify-between items-start mb-4'>
                    <span className='text-gray-400 text-sm font-medium'>{stat.label}</span>
                    <div className='bg-white/5 p-2 rounded-lg'>{stat.icon}</div>
                  </div>
                  <div className='text-3xl font-bold mb-1'>{stat.value}</div>
                  <span className='text-xs text-gray-500'>{stat.desc}</span>
                </div>
              ))}
            </div>

            {/* Dashboard Sections */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Area: Medical Updates */}
              <div className='lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
                  <FaFileMedicalAlt className='text-purple-400' />
                  Medical Registry Summary
                </h2>
                
                <div className='space-y-4'>
                  <div className='bg-white/5 border border-white/5 rounded-xl p-5 hover:bg-white/10 transition-all duration-300'>
                    <span className='bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider'>Next Appointment</span>
                    <h3 className='font-semibold text-lg mt-2'>Dr. Lerato Sibanda (GP)</h3>
                    <p className='text-sm text-gray-400 mt-1'>June 24, 2026 at 10:00 AM — Routine Consultation</p>
                  </div>

                  <div className='bg-white/5 border border-white/5 rounded-xl p-5 hover:bg-white/10 transition-all duration-300'>
                    <span className='bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider'>Medication Schedule</span>
                    <div className='mt-3 space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>Amoxicillin (500mg)</span>
                        <span className='text-gray-400'>2x daily (After meals)</span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span>Vitamin D (1000 IU)</span>
                        <span className='text-gray-400'>1x daily (Morning)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Area: Quick Tools */}
              <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                  <FaClipboardList className='text-indigo-400' />
                  Health Center
                </h2>
                <div className='space-y-3'>
                  {['Book New Appointment', 'Request Refill', 'View Lab Reports', 'Contact Care Team'].map((tool, idx) => (
                    <button key={idx} className='cursor-pointer w-full text-left bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/20 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]'>
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'appointments' ? (
          <AppointmentsSection user={user} />
        ) : activeTab === 'referrals' ? (
          <ReferralsSection user={user} />
        ) : activeTab === 'reviews' ? (
          <ReviewsSection user={user} />
        ) : (
          <div className='max-w-4xl mx-auto text-center py-20 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl'>
            <FaUser size={60} className='mx-auto mb-4 text-purple-400 animate-pulse' />
            <h2 className='text-2xl font-bold mb-2 capitalize'>{activeTab} Section</h2>
            <p className='text-gray-400 text-sm max-w-md mx-auto'>
              The features for the patient dashboard's {activeTab} tab will be fully implemented according to subsequent instructions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- CHW Dashboard Component ---
const ChwDashboard = ({ user, handleLogout }) => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'households', label: 'Households', icon: <FaUsers /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'outreach', label: 'Outreach Events', icon: <FaClock /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
  ];

  return (
    <div className='min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      {/* Sidebar */}
      <aside className='w-full md:w-64 bg-[#090b0d] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 shrink-0 relative z-20 justify-between'>
        <div>
          {/* Logo / Brand */}
          <div className='flex items-center gap-2 mb-8'>
            <div className='bg-orange-500 text-black p-1.5 rounded-lg font-bold flex items-center justify-center'>
              <FaHeartbeat size={18} />
            </div>
            <span className='text-lg font-black tracking-tight text-white'>
              Ubuntu<span className='text-orange-500'>Health</span>
            </span>
          </div>

          {/* CHW Portal Tag */}
          <div className='bg-orange-500/10 text-orange-300 border border-orange-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase mb-6 flex items-center gap-2'>
            <FaUsers />
            <span>CHW Portal</span>
          </div>

          {/* Navigation Links */}
          <nav className='space-y-1.5'>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/10' 
                    : 'bg-white/5 hover:bg-orange-500/10 text-gray-400 hover:text-orange-400 border border-transparent hover:border-orange-500/20'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout at Bottom */}
        <button 
          onClick={handleLogout} 
          className='cursor-pointer flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 px-5 py-3 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-95 mt-8 text-gray-400 hover:text-red-400'
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-6 md:p-12 overflow-y-auto relative z-10'>
        {activeTab === 'overview' ? (
          <div className='max-w-6xl mx-auto'>
            {/* Header */}
            <header className='mb-12 pb-6 border-b border-orange-500/20'>
              <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, {user.fullname}</h1>
              <p className='text-gray-400 text-sm mt-1'>Org: {user.organization}</p>
            </header>

            {/* Community Work Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
              {[
                { label: 'Households Visited', value: '45', icon: <FaUsers className='text-amber-400' />, desc: 'Target: 50 this month' },
                { label: 'Referrals Submitted', value: '18', icon: <FaExchangeAlt className='text-orange-400' />, desc: '3 pending reviews' },
                { label: 'Active Outreach Members', value: '112', icon: <FaClipboardList className='text-yellow-400' />, desc: 'Outreach cohort A' },
                { label: 'Outreach Events', value: '4', icon: <FaCalendarAlt className='text-red-400' />, desc: '1 scheduled tomorrow' }
              ].map((stat, idx) => (
                <div key={idx} className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 hover:scale-[1.02] transition-all duration-300'>
                  <div className='flex justify-between items-start mb-4'>
                    <span className='text-gray-400 text-sm font-medium'>{stat.label}</span>
                    <div className='bg-white/5 p-2 rounded-lg'>{stat.icon}</div>
                  </div>
                  <div className='text-3xl font-bold mb-1'>{stat.value}</div>
                  <span className='text-xs text-gray-500'>{stat.desc}</span>
                </div>
              ))}
            </div>

            {/* Dashboard Sections */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Area: Task List */}
              <div className='lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-xl font-bold flex items-center gap-2'>
                    <FaTasks className='text-orange-400' />
                    Home Visit Task Board
                  </h2>
                  <button className='cursor-pointer flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-black'>
                    <FaPlus size={10} /> Add Task
                  </button>
                </div>
                
                <div className='space-y-4'>
                  {[
                    { title: 'Visit Household 14', task: 'Follow-up on baby immunization records', priority: 'High', date: 'Today' },
                    { title: 'Vitamin Supplement Distribution', task: 'Deliver vitamins to elderly at Khayelitsha Center', priority: 'Medium', date: 'Tomorrow' },
                    { title: 'Referral Checkup - Sipho', task: 'Confirm sipho follow-up consult at regional clinic', priority: 'High', date: '15 Jun' },
                    { title: 'Community Session Prep', task: 'Organize posters for TB awareness session', priority: 'Low', date: '18 Jun' }
                  ].map((item, idx) => (
                    <div key={idx} className='flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300'>
                      <div>
                        <h3 className='font-semibold'>{item.title}</h3>
                        <p className='text-xs text-gray-400'>{item.task}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-semibold mb-1'>{item.date}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          item.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Area: CHW Actions */}
              <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                  <FaMedkit className='text-yellow-400' />
                  Outreach Toolbox
                </h2>
                <div className='space-y-3'>
                  {['New Household Enrollment', 'Log Community Referral', 'Record Survey Responses', 'Report Health Incident'].map((tool, idx) => (
                    <button key={idx} className='cursor-pointer w-full text-left bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/20 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]'>
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'appointments' ? (
          <AppointmentsSection user={user} />
        ) : activeTab === 'referrals' ? (
          <ReferralsSection user={user} />
        ) : activeTab === 'reviews' ? (
          <ReviewsSection user={user} />
        ) : (
          <div className='max-w-4xl mx-auto text-center py-20 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl'>
            <FaUsers size={60} className='mx-auto mb-4 text-orange-400 animate-pulse' />
            <h2 className='text-2xl font-bold mb-2 capitalize'>{activeTab} Section</h2>
            <p className='text-gray-400 text-sm max-w-md mx-auto'>
              The features for the CHW dashboard's {activeTab} tab will be fully implemented according to subsequent instructions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Reusable Appointments Section Component ---
const AppointmentsSection = ({ user }) => {
  const [appointments, setAppointments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [organizations, setOrganizations] = React.useState([]);
  const [careGivers, setCareGivers] = React.useState([]);
  
  const [newAppointment, setNewAppointment] = React.useState({
    organization: user.organization || '',
    care_giver: '',
    reason: '',
    date: '',
    time: ''
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/appointments');
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAppointments();

    const fetchOrgs = async () => {
      try {
        const res = await axios.get('/api/auth/organizations');
        setOrganizations(res.data.organizations || []);
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
      }
    };
    fetchOrgs();
  }, []);

  React.useEffect(() => {
    const fetchCaregivers = async () => {
      if (!newAppointment.organization) {
        setCareGivers([]);
        return;
      }
      try {
        const res = await axios.get(`/api/appointments/caregivers?organization=${newAppointment.organization}`);
        setCareGivers(res.data.caregivers || []);
      } catch (err) {
        console.error("Failed to fetch caregivers:", err);
      }
    };
    fetchCaregivers();
  }, [newAppointment.organization]);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!newAppointment.organization || !newAppointment.reason || !newAppointment.date || !newAppointment.time) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const date_time = `${newAppointment.date}T${newAppointment.time}`;
      const res = await axios.post('/api/appointments', {
        organization: newAppointment.organization,
        care_giver: newAppointment.care_giver || null,
        reason: newAppointment.reason,
        date_time
      });
      
      alert(`Appointment scheduled successfully!\nYour 6-digit fulfillment verification key is: ${res.data.appointment.appointment_key}`);
      fetchAppointments();
      setNewAppointment({
        organization: user.organization || '',
        care_giver: '',
        reason: '',
        date: '',
        time: ''
      });
    } catch (err) {
      console.error("Failed to create appointment:", err);
      alert(err.response?.data?.message || "Failed to create appointment");
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/appointments/${id}/status`, { status: 'approved' });
      alert("Appointment approved successfully!");
      fetchAppointments();
    } catch (err) {
      console.error("Failed to approve appointment:", err);
      alert(err.response?.data?.message || "Failed to approve appointment");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.put(`/api/appointments/${id}/status`, { status: 'cancelled' });
      alert("Appointment cancelled successfully!");
      fetchAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const handleFulfill = async (id) => {
    const key = prompt("Please enter the 6-digit verification key supplied by the patient:");
    if (!key) return;
    try {
      await axios.put(`/api/appointments/${id}/fulfill`, { appointment_key: key });
      alert("Appointment marked as fulfilled successfully!");
      fetchAppointments();
    } catch (err) {
      console.error("Failed to fulfill appointment:", err);
      alert(err.response?.data?.message || "Failed to fulfill appointment");
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'fulfilled':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    }
  };

  return (
    <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
      {/* Historical Appointments list */}
      <div className='lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6'>
        <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
          <FaCalendarAlt className='text-violet-400' />
          Appointment Logs
        </h2>
        {loading ? (
          <div className='text-center py-12 text-gray-500 text-sm'>
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className='text-center py-12 text-gray-500 text-sm'>
            No appointments found.
          </div>
        ) : (
          <div className='space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar'>
            {appointments.map(app => {
              const isAdminOfOrg = user.role === 'admin' && user.organization?.toLowerCase() === app.organization?.toLowerCase();
              const isAssignedCaregiver = app.care_giver && app.care_giver.toString() === user.id.toString();
              const isCreator = Number(app.visitor_id) === Number(user.id);
              const showActions = app.status === 'pending' || app.status === 'approved';

              return (
                <div key={app.id} className='bg-white/5 border border-white/5 hover:border-violet-500/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                  <div className='flex-1 pr-2 text-left'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                      <span className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider'>{new Date(app.date_time).toLocaleString()}</span>
                    </div>
                    <h3 className='font-bold text-sm text-violet-300'>{app.reason}</h3>
                    <p className='text-xs text-gray-400 mt-1'><span className='font-semibold text-gray-500'>Org:</span> {app.organization}</p>
                    <p className='text-xs text-gray-400 mt-0.5'><span className='font-semibold text-gray-500'>Visitor:</span> {app.visitor_name || `ID: ${app.visitor_id}`}</p>
                    <p className='text-xs text-gray-400 mt-0.5'><span className='font-semibold text-gray-500'>Caregiver:</span> {app.care_giver_name || (app.care_giver ? `ID: ${app.care_giver}` : 'Not assigned')}</p>
                    {app.appointment_key && (
                      <div className='mt-3 bg-violet-500/10 border border-violet-500/20 px-3 py-2 rounded-xl text-xs flex justify-between items-center max-w-xs'>
                        <span className='text-gray-400 font-semibold uppercase tracking-wider text-[10px]'>Verification Key</span>
                        <span className='font-mono font-black text-violet-400 text-sm tracking-widest'>{app.appointment_key}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions column */}
                  {showActions && (
                    <div className='flex gap-2 shrink-0 md:flex-col w-full md:w-auto'>
                      {app.status === 'pending' && (isAdminOfOrg || isAssignedCaregiver) && (
                        <button 
                          onClick={() => handleApprove(app.id)}
                          className='cursor-pointer flex-1 md:flex-initial bg-violet-500 hover:bg-violet-600 text-black text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-300'
                        >
                          Approve
                        </button>
                      )}
                      {app.status === 'approved' && (isAdminOfOrg || isAssignedCaregiver) && (
                        <button 
                          onClick={() => handleFulfill(app.id)}
                          className='cursor-pointer flex-1 md:flex-initial bg-emerald-500 hover:bg-emerald-600 text-black text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-300'
                        >
                          Fulfill
                        </button>
                      )}
                      {(isCreator || isAdminOfOrg || isAssignedCaregiver) && (
                        <button 
                          onClick={() => handleCancel(app.id)}
                          className='cursor-pointer flex-1 md:flex-initial bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/20 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-300'
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Form */}
      <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
        <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
          <FaPlusCircle className='text-fuchsia-400' />
          Book Appointment
        </h2>
        <form onSubmit={handleCreateAppointment} className='space-y-4 text-left'>
          <div>
            <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Organization <span className='text-red-400'>*</span></label>
            <select 
              value={newAppointment.organization} 
              onChange={e => setNewAppointment({ ...newAppointment, organization: e.target.value, care_giver: '' })} 
              className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
              required
            >
              <option value="" disabled className='bg-slate-900'>Select Organization</option>
              {organizations.map((org, idx) => (
                <option key={idx} value={org} className='bg-slate-900'>{org}</option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Assigned Caregiver</label>
            <select 
              value={newAppointment.care_giver} 
              onChange={e => setNewAppointment({ ...newAppointment, care_giver: e.target.value })} 
              className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
            >
              <option value="" className='bg-slate-900'>Select Caregiver (Optional)</option>
              {careGivers.map(cg => (
                <option key={cg.id} value={cg.id} className='bg-slate-900'>ID: {cg.id} — {cg.fullname}</option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Date <span className='text-red-400'>*</span></label>
              <input 
                type="date" 
                value={newAppointment.date} 
                onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })} 
                className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs' 
                required
              />
            </div>
            <div>
              <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Time <span className='text-red-400'>*</span></label>
              <input 
                type="time" 
                value={newAppointment.time} 
                onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })} 
                className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs' 
                required
              />
            </div>
          </div>

          <div>
            <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Reason <span className='text-red-400'>*</span></label>
            <textarea 
              placeholder="Provide reason for booking (e.g. general body checkup)..." 
              value={newAppointment.reason} 
              onChange={e => setNewAppointment({ ...newAppointment, reason: e.target.value })} 
              className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs resize-none h-24' 
              required
            ></textarea>
          </div>

          <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-3 rounded-xl transition-all duration-300 text-xs mt-2 hover:scale-[1.01] active:scale-95 shadow-lg shadow-violet-500/25'>
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Reusable Reviews Section Component ---
const ReviewsSection = ({ user }) => {
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [newReview, setNewReview] = React.useState({ rating: 5, comment: '' });
  const [editingId, setEditingId] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ rating: 5, comment: '' });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/reviews/my');
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch my reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
  }, []);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      alert("Please write a comment.");
      return;
    }
    try {
      await axios.post('/api/reviews', {
        rating: newReview.rating,
        comment: newReview.comment.trim()
      });
      alert("Review posted successfully!");
      fetchReviews();
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      console.error("Failed to create review:", err);
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  const handleStartEdit = (review) => {
    setEditingId(review.id);
    setEditForm({ rating: review.rating, comment: review.comment || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, comment: '' });
  };

  const handleUpdateReview = async (e, id) => {
    e.preventDefault();
    if (!editForm.comment.trim()) {
      alert("Please write a comment.");
      return;
    }
    try {
      await axios.put(`/api/reviews/${id}`, {
        rating: editForm.rating,
        comment: editForm.comment.trim()
      });
      alert("Review updated successfully!");
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      console.error("Failed to update review:", err);
      alert(err.response?.data?.message || "Failed to update review");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`/api/reviews/${id}`);
      alert("Review deleted successfully!");
      fetchReviews();
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  const getRoleColors = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          primaryBg: 'bg-violet-500',
          primaryHover: 'hover:bg-violet-600',
          text: 'text-violet-400',
          border: 'border-violet-500/20',
          shadow: 'shadow-violet-500/25',
          badge: 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
        };
      case 'staff':
        return {
          primaryBg: 'bg-emerald-500',
          primaryHover: 'hover:bg-emerald-600',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          shadow: 'shadow-emerald-500/25',
          badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        };
      case 'chw':
        return {
          primaryBg: 'bg-orange-500',
          primaryHover: 'hover:bg-orange-600',
          text: 'text-orange-400',
          border: 'border-orange-500/20',
          shadow: 'shadow-orange-500/25',
          badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
        };
      case 'patient':
      default:
        return {
          primaryBg: 'bg-purple-500',
          primaryHover: 'hover:bg-purple-600',
          text: 'text-purple-400',
          border: 'border-purple-500/20',
          shadow: 'shadow-purple-500/25',
          badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
        };
    }
  };

  const colors = getRoleColors(user.role);

  return (
    <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
      <div className='lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6'>
        <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
          <FaStar className={colors.text} />
          My Feedback Logs
        </h2>
        {loading ? (
          <div className='text-center py-12 text-gray-500 text-sm'>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className='text-center py-12 text-gray-500 text-sm'>
            You haven't written any reviews yet. Write one on the right!
          </div>
        ) : (
          <div className='space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar text-left'>
            {reviews.map(r => (
              <div key={r.id} className={`bg-white/5 border border-white/5 hover:${colors.border} rounded-xl p-5 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between gap-4`}>
                {editingId === r.id ? (
                  <form onSubmit={(e) => handleUpdateReview(e, r.id)} className='space-y-3 w-full'>
                    <div>
                      <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider'>Rating Stars</label>
                      <select 
                        value={editForm.rating} 
                        onChange={e => setEditForm({ ...editForm, rating: parseInt(e.target.value) })} 
                        className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs'
                      >
                        {[5, 4, 3, 2, 1, 0].map(num => (
                          <option key={num} value={num} className='bg-slate-900'>{num} Stars</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider'>Comment</label>
                      <textarea 
                        value={editForm.comment} 
                        onChange={e => setEditForm({ ...editForm, comment: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs resize-none h-24'
                        required
                      />
                    </div>
                    <div className='flex gap-2 justify-end'>
                      <button 
                        type="button" 
                        onClick={handleCancelEdit}
                        className='cursor-pointer bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300'
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className={`cursor-pointer ${colors.primaryBg} ${colors.primaryHover} text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-300`}
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className='flex justify-between items-start'>
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center gap-1'>
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < r.rating ? 'text-yellow-500' : 'text-gray-700'} size={12} />
                          ))}
                        </div>
                        <span className='text-[10px] text-gray-500 font-semibold uppercase tracking-wider'>{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                      <div className='flex gap-2'>
                        <button 
                          onClick={() => handleStartEdit(r)}
                          className='cursor-pointer text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-300'
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteReview(r.id)}
                          className='cursor-pointer text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-300'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className='text-xs text-gray-300 italic'>"{r.comment}"</p>
                    <div className='text-[10px] text-gray-500 flex items-center gap-1.5 mt-1'>
                      <span className='font-semibold text-gray-400'>Role:</span> <span>{r.reviewer_role}</span>
                      {r.reviewer_org && (
                        <>
                          <span className='text-white/20'>|</span>
                          <span className='font-semibold text-gray-400'>Org:</span> <span>{r.reviewer_org}</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
        <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
          <FaPlusCircle className={colors.text} />
          Write Feedback
        </h2>
        <form onSubmit={handleCreateReview} className='space-y-4 text-left'>
          <div>
            <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider'>Rating Stars</label>
            <select 
              value={newReview.rating} 
              onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value) })} 
              className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
            >
              {[5, 4, 3, 2, 1, 0].map(num => (
                <option key={num} value={num} className='bg-slate-900'>{num} Stars</option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider'>Comment <span className='text-red-400'>*</span></label>
            <textarea 
              placeholder="Your comments or review about the website system..." 
              value={newReview.comment} 
              onChange={e => setNewReview({ ...newReview, comment: e.target.value })} 
              className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs resize-none h-28' 
              required
            ></textarea>
          </div>

          <button type="submit" className={`cursor-pointer w-full ${colors.primaryBg} ${colors.primaryHover} text-black font-extrabold py-3 rounded-xl transition-all duration-300 text-xs mt-2 hover:scale-[1.01] active:scale-95 shadow-lg ${colors.shadow}`}>
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Reusable Referrals Section Component ---
const ReferralsSection = ({ user }) => {
  const [referrals, setReferrals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [patients, setPatients] = React.useState([]);
  const [chws, setChws] = React.useState([]);
  const [organizations, setOrganizations] = React.useState([]);
  const [selectedReferral, setSelectedReferral] = React.useState(null);
  
  // Dynamic staff members for selected destination organization
  const [staffList, setStaffList] = React.useState([]);
  const [editStaffList, setEditStaffList] = React.useState([]);

  // Predefined departments list
  const DEPARTMENTS = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'General Medicine', 'Neurology', 'Obstetrics & Gynecology',
    'Oncology', 'Ophthalmology', 'Orthopedics', 'Pediatrics',
    'Psychiatry', 'Radiology', 'Surgery', 'Urology', 'Other'
  ];

  // Creation form state
  const [newReferral, setNewReferral] = React.useState({
    patient_id: '',
    organization_to: '',
    department_to: '',
    custom_department: '',
    staff_to: '',
    reason: '',
    arrival_date: ''
  });

  // Editing state
  const [editingId, setEditingId] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    patient_id: '',
    organization_to: '',
    department_to: '',
    custom_department: '',
    staff_to: '',
    reason: '',
    arrival_date: ''
  });

  const getRoleColors = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          primaryBg: 'bg-violet-500',
          primaryHover: 'hover:bg-violet-600',
          text: 'text-violet-400',
          border: 'border-violet-500/20',
          shadow: 'shadow-violet-500/25',
          badge: 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
        };
      case 'staff':
        return {
          primaryBg: 'bg-emerald-500',
          primaryHover: 'hover:bg-emerald-600',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          shadow: 'shadow-emerald-500/25',
          badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        };
      case 'chw':
        return {
          primaryBg: 'bg-orange-500',
          primaryHover: 'hover:bg-orange-600',
          text: 'text-orange-400',
          border: 'border-orange-500/20',
          shadow: 'shadow-orange-500/25',
          badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
        };
      case 'patient':
      default:
        return {
          primaryBg: 'bg-purple-500',
          primaryHover: 'hover:bg-purple-600',
          text: 'text-purple-400',
          border: 'border-purple-500/20',
          shadow: 'shadow-purple-500/25',
          badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
        };
    }
  };

  const colors = getRoleColors(user.role);
  const canManage = ['admin', 'staff'].includes(user.role?.toLowerCase());

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/referrals');
      setReferrals(res.data.referrals || []);
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReferrals();

    if (canManage) {
      const fetchPatients = async () => {
        try {
          const res = await axios.get('/api/patients');
          setPatients(res.data.patients || []);
        } catch (err) {
          console.error("Failed to fetch patients:", err);
        }
      };
      const fetchOrgs = async () => {
        try {
          const res = await axios.get('/api/auth/organizations');
          setOrganizations(res.data.organizations || []);
        } catch (err) {
          console.error("Failed to fetch organizations:", err);
        }
      };
      fetchPatients();
      fetchOrgs();

      if (user.role?.toLowerCase() === 'admin') {
        const fetchChws = async () => {
          try {
            const res = await axios.get('/api/chw');
            setChws(res.data.chws || []);
          } catch (err) {
            console.error("Failed to fetch CHWs:", err);
          }
        };
        fetchChws();
      }
    }
  }, [user.role]);

  // Dynamically load staff for newReferral organization destination
  React.useEffect(() => {
    const fetchStaffForNew = async () => {
      if (!newReferral.organization_to) {
        setStaffList([]);
        return;
      }
      try {
        const res = await axios.get(`/api/appointments/caregivers?organization=${newReferral.organization_to}`);
        setStaffList(res.data.caregivers || []);
      } catch (err) {
        console.error("Failed to fetch staff members for organization:", err);
      }
    };
    fetchStaffForNew();
  }, [newReferral.organization_to]);

  // Dynamically load staff for editForm organization destination
  React.useEffect(() => {
    const fetchStaffForEdit = async () => {
      if (!editForm.organization_to) {
        setEditStaffList([]);
        return;
      }
      try {
        const res = await axios.get(`/api/appointments/caregivers?organization=${editForm.organization_to}`);
        setEditStaffList(res.data.caregivers || []);
      } catch (err) {
        console.error("Failed to fetch staff members for organization edit:", err);
      }
    };
    fetchStaffForEdit();
  }, [editForm.organization_to]);

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    const finalDepartment = newReferral.department_to === 'Other' ? newReferral.custom_department : newReferral.department_to;
    
    if (!newReferral.patient_id || !newReferral.organization_to || !finalDepartment || !newReferral.reason || !newReferral.arrival_date) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await axios.post('/api/referrals', {
        patient_id: newReferral.patient_id,
        organization_to: newReferral.organization_to,
        department_to: finalDepartment,
        staff_to: newReferral.staff_to || null,
        reason: newReferral.reason,
        arrival_date: newReferral.arrival_date
      });
      alert("Referral logged successfully!");
      fetchReferrals();
      setNewReferral({
        patient_id: '',
        organization_to: '',
        department_to: '',
        custom_department: '',
        staff_to: '',
        reason: '',
        arrival_date: ''
      });
    } catch (err) {
      console.error("Failed to create referral:", err);
      alert(err.response?.data?.message || "Failed to create referral");
    }
  };

  const handleStartEdit = (ref) => {
    const isPredefined = DEPARTMENTS.includes(ref.department_to);
    setEditingId(ref.id);
    setEditForm({
      patient_id: ref.patient_id,
      organization_to: ref.organization_to,
      department_to: isPredefined ? ref.department_to : 'Other',
      custom_department: isPredefined ? '' : ref.department_to,
      staff_to: ref.staff_to || '',
      reason: ref.reason,
      arrival_date: ref.arrival_date ? ref.arrival_date.substring(0, 10) : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateReferral = async (e, id) => {
    e.preventDefault();
    const finalDepartment = editForm.department_to === 'Other' ? editForm.custom_department : editForm.department_to;
    
    if (!editForm.patient_id || !editForm.organization_to || !finalDepartment || !editForm.reason || !editForm.arrival_date) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await axios.put(`/api/referrals/${id}`, {
        patient_id: editForm.patient_id,
        organization_to: editForm.organization_to,
        department_to: finalDepartment,
        staff_to: editForm.staff_to || null,
        reason: editForm.reason,
        arrival_date: editForm.arrival_date
      });
      alert("Referral updated successfully!");
      setEditingId(null);
      fetchReferrals();
    } catch (err) {
      console.error("Failed to update referral:", err);
      alert(err.response?.data?.message || "Failed to update referral");
    }
  };

  const handleDeleteReferral = async (id) => {
    if (!confirm("Are you sure you want to delete this referral?")) return;
    try {
      await axios.delete(`/api/referrals/${id}`);
      alert("Referral deleted successfully!");
      fetchReferrals();
      if (selectedReferral?.id === id) {
        setSelectedReferral(null);
      }
    } catch (err) {
      console.error("Failed to delete referral:", err);
      alert(err.response?.data?.message || "Failed to delete referral");
    }
  };

  const handleFulfillReferral = async (id) => {
    const key = prompt("Please enter the 6-character patient secure key:");
    if (!key) return;
    try {
      await axios.put(`/api/referrals/${id}/fulfill`, { referral_key: key });
      alert("Referral marked as fulfilled successfully!");
      fetchReferrals();
      if (selectedReferral?.id === id) {
        // Refresh selected referral view
        const updatedRes = await axios.get('/api/referrals');
        const updated = updatedRes.data.referrals.find(r => r.id === id);
        if (updated) setSelectedReferral(updated);
      }
    } catch (err) {
      console.error("Failed to fulfill referral:", err);
      alert(err.response?.data?.message || "Failed to fulfill referral");
    }
  };

  const handleDownloadTicket = (ref) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const orgFrom = ref.organization_from || 'Mzansi Health';

      // 1. Watermark with the organization_from name (diagonal text from bottom left to top right)
      doc.setTextColor(243, 244, 246); // Very light grey (slate-50 equivalent)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(54);
      // Center watermarks diagonally (315 degrees is counter-clockwise rotation, drawing from bottom-left to top-right)
      doc.text(orgFrom.toUpperCase(), 105, 150, { align: 'center', angle: 315 });

      // 2. Document Header / Title
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("MZANSI HEALTH", 105, 25, { align: 'center' });
      
      doc.setFontSize(13);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text("Official Medical Referral Ticket", 105, 33, { align: 'center' });

      // Horizontal line separator
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);

      // 3. Referral Details Setup
      const startX = 25;
      let currentY = 52;
      const spacingY = 9;

      const drawDetailRow = (label, value) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(10);
        doc.text(label, startX, currentY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10.5);
        doc.text(value || 'N/A', startX + 50, currentY);
        
        currentY += spacingY;
      };

      drawDetailRow("Referral ID:", `#${ref.id}`);
      drawDetailRow("Reason / Diagnosis:", ref.reason);
      drawDetailRow("Patient Name:", ref.patient_name || `ID: ${ref.patient_id}`);
      drawDetailRow("Patient Identity:", ref.patient_identity || 'N/A');
      drawDetailRow("From Organization:", ref.organization_from || 'N/A');
      drawDetailRow("To Organization:", ref.organization_to);
      drawDetailRow("To Department:", ref.department_to);
      drawDetailRow("To Staff Member:", ref.staff_to || 'General / Any');
      drawDetailRow("Expected Arrival:", ref.arrival_date ? new Date(ref.arrival_date).toLocaleDateString() : 'N/A');
      drawDetailRow("Referral Status:", ref.status ? ref.status.toUpperCase() : 'PENDING');
      
      if (ref.referral_key) {
        drawDetailRow("Verification Key:", ref.referral_key);
      }

      // Add a border box around the details
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.setLineWidth(0.3);
      doc.rect(20, 44, 170, currentY - 44 + 1);

      // 4. Footer Note
      currentY += 15;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text("Thank you for choosing Mzansi Health. Please present this ticket at your destination facility.", 105, currentY, { align: 'center' });
      currentY += 5;
      doc.text("Generated on: " + new Date().toLocaleString(), 105, currentY, { align: 'center' });

      // 5. Download the PDF file directly
      doc.save(`referral_ticket_${ref.id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF ticket:", err);
      alert("Failed to generate PDF ticket. Please try again.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'pending':
      default:
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    }
  };

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left/Main list: takes 2 cols if canManage, or 3 cols if patient */}
        <div className={`${canManage ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white/5 border border-white/10 rounded-2xl p-6`}>
          <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
            <FaExchangeAlt className={colors.text} />
            Referrals Directory
          </h2>
          {loading ? (
            <div className='text-center py-12 text-gray-500 text-sm'>
              Loading referrals...
            </div>
          ) : referrals.length === 0 ? (
            <div className='text-center py-12 text-gray-500 text-sm'>
              No referrals logged.
            </div>
          ) : (
            <div className='space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar text-left'>
              {referrals.map(ref => (
                <div 
                  key={ref.id} 
                  className={`bg-white/5 border border-white/5 hover:${colors.border} rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
                >
                  {/* Clickable details area */}
                  <div 
                    onClick={() => setSelectedReferral(ref)}
                    className='flex-1 cursor-pointer pr-2'
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide ${getStatusStyle(ref.status)}`}>
                        {ref.status}
                      </span>
                      <span className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider'>
                        Arrival: {ref.arrival_date ? new Date(ref.arrival_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <h3 className='font-bold text-sm text-violet-300'>{ref.reason}</h3>
                    <div className='grid grid-cols-2 gap-x-2 mt-2 text-xs text-gray-400'>
                      <p><span className='font-semibold text-gray-500'>Patient:</span> {ref.patient_name || `ID: ${ref.patient_id}`}</p>
                      <p><span className='font-semibold text-gray-500'>To Org:</span> {ref.organization_to}</p>
                      <p><span className='font-semibold text-gray-500'>Dept:</span> {ref.department_to}</p>
                      <p><span className='font-semibold text-gray-500'>Staff:</span> {ref.staff_to || 'General / None'}</p>
                    </div>
                    {ref.referral_key && (
                      <div className='mt-2.5 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center max-w-xs' onClick={e => e.stopPropagation()}>
                        <span className='text-gray-400 font-semibold uppercase tracking-wider text-[9px]'>Secure Key (Patient Only)</span>
                        <span className='font-mono font-black text-purple-400 text-sm tracking-widest'>{ref.referral_key}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className='flex gap-2 shrink-0 md:flex-col w-full md:w-auto'>
                    <button 
                      onClick={() => handleDownloadTicket(ref)}
                      className='cursor-pointer flex-1 md:flex-initial bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-300'
                    >
                      Download Ticket
                    </button>
                    {canManage && (
                      <>
                        {ref.status !== 'fulfilled' && (
                          <button 
                            onClick={() => handleFulfillReferral(ref.id)}
                            className='cursor-pointer flex-1 md:flex-initial bg-emerald-500 hover:bg-emerald-600 text-black text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-300'
                          >
                            Fulfill
                          </button>
                        )}
                        {Number(ref.referrer_id) === Number(user.id) && (
                          <>
                            <button 
                              onClick={() => handleStartEdit(ref)}
                              className='cursor-pointer flex-1 md:flex-initial bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/10 transition-all duration-300'
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteReferral(ref.id)}
                              className='cursor-pointer flex-1 md:flex-initial bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-300'
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Create form (Only Staff/Admin) */}
        {canManage && (
          <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit text-left'>
            {editingId ? (
              // EDIT FORM
              <form onSubmit={(e) => handleUpdateReferral(e, editingId)} className='space-y-4'>
                <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                  <FaPlusCircle className={colors.text} />
                  Edit Referral
                </h2>
                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Referral Target <span className='text-red-400'>*</span></label>
                  <select 
                    value={editForm.patient_id} 
                    onChange={e => setEditForm({ ...editForm, patient_id: e.target.value })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                    required
                  >
                    <option value="" disabled className='bg-slate-900'>Select Target</option>
                    {user.role?.toLowerCase() === 'admin' ? (
                      <>
                        <optgroup label="Patients" className='bg-slate-900'>
                          {patients.map(p => (
                            <option key={`pat-${p.id}`} value={p.id} className='bg-slate-900'>{p.fullname} (ID: {p.identity})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Community Health Workers" className='bg-slate-900'>
                          {chws.map(c => (
                            <option key={`chw-${c.id}`} value={c.id} className='bg-slate-900'>{c.fullname} (ID: {c.identity})</option>
                          ))}
                        </optgroup>
                      </>
                    ) : (
                      patients.map(p => (
                        <option key={p.id} value={p.id} className='bg-slate-900'>{p.fullname} (ID: {p.identity})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Destination Org <span className='text-red-400'>*</span></label>
                  <select 
                    value={editForm.organization_to} 
                    onChange={e => setEditForm({ ...editForm, organization_to: e.target.value, staff_to: '' })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                    required
                  >
                    <option value="" disabled className='bg-slate-900'>Select Destination Organization</option>
                    {organizations.map((org, idx) => (
                      <option key={idx} value={org} className='bg-slate-900'>{org}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Department <span className='text-red-400'>*</span></label>
                  <select 
                    value={editForm.department_to} 
                    onChange={e => setEditForm({ ...editForm, department_to: e.target.value, custom_department: '' })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                    required
                  >
                    <option value="" disabled className='bg-slate-900'>Select Department</option>
                    {DEPARTMENTS.map((dept, idx) => (
                      <option key={idx} value={dept} className='bg-slate-900'>{dept}</option>
                    ))}
                  </select>
                </div>

                {editForm.department_to === 'Other' && (
                  <div>
                    <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Custom Department <span className='text-red-400'>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter custom department" 
                      value={editForm.custom_department} 
                      onChange={e => setEditForm({ ...editForm, custom_department: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      required
                    />
                  </div>
                )}

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Staff Recipient (To)</label>
                  <select 
                    value={editForm.staff_to} 
                    onChange={e => setEditForm({ ...editForm, staff_to: e.target.value })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                  >
                    <option value="" className='bg-slate-900'>Select Staff (Optional)</option>
                    {editStaffList.map(st => (
                      <option key={st.id} value={st.fullname} className='bg-slate-900'>{st.fullname}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Arrival Date <span className='text-red-400'>*</span></label>
                  <input 
                    type="date" 
                    value={editForm.arrival_date} 
                    onChange={e => setEditForm({ ...editForm, arrival_date: e.target.value })} 
                    className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500' 
                    required
                  />
                </div>

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Reason <span className='text-red-400'>*</span></label>
                  <textarea 
                    placeholder="Provide detailed referral reason..." 
                    value={editForm.reason} 
                    onChange={e => setEditForm({ ...editForm, reason: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs resize-none h-24' 
                    required
                  ></textarea>
                </div>

                <div className='flex gap-2 mt-2'>
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className='cursor-pointer flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2.5 rounded-xl transition-all duration-300 text-xs border border-white/10'
                  >
                    Cancel
                  </button>
                  <button type="submit" className={`cursor-pointer flex-1 ${colors.primaryBg} ${colors.primaryHover} text-black font-extrabold py-2.5 rounded-xl transition-all duration-300 text-xs shadow-lg ${colors.shadow}`}>
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              // CREATE FORM
              <form onSubmit={handleCreateReferral} className='space-y-4'>
                <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                  <FaPlusCircle className={colors.text} />
                  Book Referral Log
                </h2>
                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Referral Target <span className='text-red-400'>*</span></label>
                  <select 
                    value={newReferral.patient_id} 
                    onChange={e => setNewReferral({ ...newReferral, patient_id: e.target.value })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                    required
                  >
                    <option value="" disabled className='bg-slate-900'>Select Target</option>
                    {user.role?.toLowerCase() === 'admin' ? (
                      <>
                        <optgroup label="Patients" className='bg-slate-900'>
                          {patients.map(p => (
                            <option key={`pat-${p.id}`} value={p.id} className='bg-slate-900'>{p.fullname} (ID: {p.identity})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Community Health Workers" className='bg-slate-900'>
                          {chws.map(c => (
                            <option key={`chw-${c.id}`} value={c.id} className='bg-slate-900'>{c.fullname} (ID: {c.identity})</option>
                          ))}
                        </optgroup>
                      </>
                    ) : (
                      patients.map(p => (
                        <option key={p.id} value={p.id} className='bg-slate-900'>{p.fullname} (ID: {p.identity})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Destination Org <span className='text-red-400'>*</span></label>
                  <select 
                    value={newReferral.organization_to} 
                    onChange={e => setNewReferral({ ...newReferral, organization_to: e.target.value, staff_to: '' })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                    required
                  >
                    <option value="" disabled className='bg-slate-900'>Select Destination Organization</option>
                    {organizations.map((org, idx) => (
                      <option key={idx} value={org} className='bg-slate-900'>{org}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Department <span className='text-red-400'>*</span></label>
                  <select 
                    value={newReferral.department_to} 
                    onChange={e => setNewReferral({ ...newReferral, department_to: e.target.value, custom_department: '' })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                    required
                  >
                    <option value="" disabled className='bg-slate-900'>Select Department</option>
                    {DEPARTMENTS.map((dept, idx) => (
                      <option key={idx} value={dept} className='bg-slate-900'>{dept}</option>
                    ))}
                  </select>
                </div>

                {newReferral.department_to === 'Other' && (
                  <div>
                    <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Custom Department <span className='text-red-400'>*</span></label>
                    <input 
                      type="text" 
                      placeholder="Enter custom department" 
                      value={newReferral.custom_department} 
                      onChange={e => setNewReferral({ ...newReferral, custom_department: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      required
                    />
                  </div>
                )}

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Staff Recipient (To)</label>
                  <select 
                    value={newReferral.staff_to} 
                    onChange={e => setNewReferral({ ...newReferral, staff_to: e.target.value })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                  >
                    <option value="" className='bg-slate-900'>Select Staff (Optional)</option>
                    {staffList.map(st => (
                      <option key={st.id} value={st.fullname} className='bg-slate-900'>{st.fullname}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Arrival Date <span className='text-red-400'>*</span></label>
                  <input 
                    type="date" 
                    value={newReferral.arrival_date} 
                    onChange={e => setNewReferral({ ...newReferral, arrival_date: e.target.value })} 
                    className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500' 
                    required
                  />
                </div>

                <div>
                  <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Reason <span className='text-red-400'>*</span></label>
                  <textarea 
                    placeholder="Provide reason for booking (e.g. cardiac follow-up consult)..." 
                    value={newReferral.reason} 
                    onChange={e => setNewReferral({ ...newReferral, reason: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs resize-none h-24' 
                    required
                  ></textarea>
                </div>

                <button type="submit" className={`cursor-pointer w-full ${colors.primaryBg} ${colors.primaryHover} text-black font-extrabold py-3 rounded-xl transition-all duration-300 text-xs mt-2 hover:scale-[1.01] active:scale-95 shadow-lg ${colors.shadow}`}>
                  Book Referral
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Referral Card Modal Detail View */}
      {selectedReferral && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300'>
          <div className='bg-[#0c0f13] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 text-left text-white'>
            {/* Header / Colored banner */}
            <div className={`p-6 ${colors.primaryBg} text-black flex justify-between items-start`}>
              <div>
                <span className='text-[10px] font-black uppercase tracking-widest bg-black/20 text-black px-2 py-0.5 rounded-full'>
                  Referral ID: #{selectedReferral.id}
                </span>
                <h3 className='text-xl font-black mt-2 tracking-tight'>Referral Card</h3>
              </div>
              <button 
                onClick={() => setSelectedReferral(null)}
                className='cursor-pointer text-black hover:text-black/70 font-bold text-lg p-1 bg-black/5 rounded-full'
              >
                ✕
              </button>
            </div>

            {/* Details */}
            <div className='p-6 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Patient Name</h4>
                  <p className='text-sm font-semibold text-white'>{selectedReferral.patient_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Patient Identity</h4>
                  <p className='text-sm font-semibold text-white'>{selectedReferral.patient_identity || 'N/A'}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 border-t border-white/5 pt-3'>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Originating Clinic (From)</h4>
                  <p className='text-sm font-semibold text-white'>{selectedReferral.organization_from || 'N/A'}</p>
                </div>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Destination Clinic (To)</h4>
                  <p className='text-sm font-semibold text-white'>{selectedReferral.organization_to || 'N/A'}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 border-t border-white/5 pt-3'>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Referrer Name</h4>
                  <p className='text-sm font-semibold text-white'>{selectedReferral.referrer_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Referrer Role</h4>
                  <p className='text-sm font-semibold text-white'>{selectedReferral.referrer_role || 'N/A'}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 border-t border-white/5 pt-3'>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Destination Department</h4>
                  <p className='text-sm font-semibold text-white'>{selectedReferral.department_to || 'N/A'}</p>
                </div>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Destination Staff Recipient</h4>
                  <p className='text-sm font-semibold text-white'>{selectedReferral.staff_to || 'General / None'}</p>
                </div>
              </div>

              <div className='border-t border-white/5 pt-3'>
                <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Arrival Date</h4>
                <p className='text-sm font-semibold text-white'>
                  {selectedReferral.arrival_date ? new Date(selectedReferral.arrival_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
              </div>

              <div className='border-t border-white/5 pt-3'>
                <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider'>Reason for Referral</h4>
                <p className='text-xs text-gray-300 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-3 mt-1'>
                  {selectedReferral.reason}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4 border-t border-white/5 pt-3 items-center'>
                <div>
                  <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1'>Status</h4>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${getStatusStyle(selectedReferral.status)}`}>
                    {selectedReferral.status}
                  </span>
                </div>

                {selectedReferral.referral_key && (
                  <div>
                    <h4 className='text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1'>Secure Verification Key</h4>
                    <span className='font-mono font-black text-purple-400 text-sm tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded'>
                      {selectedReferral.referral_key}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className='bg-black/30 border-t border-white/5 p-4 flex flex-col sm:flex-row gap-3'>
              <button 
                onClick={() => handleDownloadTicket(selectedReferral)}
                className='cursor-pointer flex-1 bg-violet-600 hover:bg-violet-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all duration-300 hover:scale-[1.01]'
              >
                Download Ticket
              </button>
              {canManage && selectedReferral.status !== 'fulfilled' && (
                <button 
                  onClick={() => handleFulfillReferral(selectedReferral.id)}
                  className='cursor-pointer flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-2.5 rounded-xl text-xs transition-all duration-300 hover:scale-[1.01]'
                >
                  Verify Key & Fulfill
                </button>
              )}
              <button 
                onClick={() => setSelectedReferral(null)}
                className='cursor-pointer flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-all duration-300 border border-white/10'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Admin Dashboard Component ---
const AdminDashboard = ({ user, handleLogout }) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [organizationsCount, setOrganizationsCount] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('overview');

  // --- Patients Database ---
  const [patients, setPatients] = React.useState([]);


  const [chws, setChws] = React.useState([
    { id: 1, fullname: "Sizwe Dube", identity: "9102145321087", phone_number: "0734445555", email: "sizwe.dube@ubuntuhealth.org", area: "Khayelitsha Site C", tasks: [
      { id: 1, title: "Deliver immunizations", desc: "Immunization follow-up for newborn in Household 4", priority: "High", deadline: "2026-06-14", status: "Assigned" },
      { id: 2, title: "TB screening", desc: "Screen contacts of active TB patient in Block A", priority: "High", deadline: "2026-06-10", status: "Completed" }
    ]},
    { id: 2, fullname: "Nokuthula Zulu", identity: "9310050876092", phone_number: "0847778888", email: "n.zulu@ubuntuhealth.org", area: "Nyanga Block 3", tasks: [
      { id: 3, title: "Hypertension check", desc: "Confirm blood pressure compliance for Mrs. Cele", priority: "Medium", deadline: "2026-06-15", status: "Assigned" }
    ]}
  ]);

  const [appointments, setAppointments] = React.useState([
    { id: 1, patientName: "Thabo Cele", staffName: "Dr. Lerato Sibanda", date: "2026-06-16", time: "09:30 AM", status: "Scheduled" },
    { id: 2, patientName: "Johan Botha", staffName: "Dr. Alan Mercer", date: "2026-06-17", time: "11:00 AM", status: "Scheduled" }
  ]);

  const [staff, setStaff] = React.useState([
    { id: 1, fullname: "Dr. Lerato Sibanda", role: "General Practitioner", email: "l.sibanda@ubuntuhealth.org", phone_number: "0721112222", availability: "Available" },
    { id: 2, fullname: "Dr. Alan Mercer", role: "Cardiologist", email: "a.mercer@ubuntuhealth.org", phone_number: "0813334444", availability: "On Leave" },
    { id: 3, fullname: "Sister Helen Ndlovu", role: "Senior Nurse", email: "h.ndlovu@ubuntuhealth.org", phone_number: "0625556666", availability: "On Duty" }
  ]);

  // Reviews state removed to use database reviews in ReviewsSection

  const [chatMessages, setChatMessages] = React.useState([
    { id: 1, sender: "System", recipient: "All", message: "Welcome to the UbuntuHealth Admin Chat Room. Select a target group or contact to start.", timestamp: "16:00" }
  ]);

  // --- Form Input States ---
  const [newPatient, setNewPatient] = React.useState({
    fullname: '',
    identity: '',
    gender: 'Male',
    password: '',
    email: '',
    phone_number: '',
    diagnosis: '',
    house_number: '',
    surbub: '',
    municipality: '',
    city: '',
    nok_fullname: '',
    nok_phone: '',
    nok_email: ''
  });
  const [newChw, setNewChw] = React.useState({
    employee_id: '',
    fullname: '',
    identity: '',
    password: '',
    email: '',
    phone_number: ''
  });
  const [newTask, setNewTask] = React.useState({ title: '', desc: '', priority: 'High', deadline: '' });
  const [newAppointment, setNewAppointment] = React.useState({ patientName: '', staffName: '', date: '', time: '' });
  // newReview state removed to use database reviews in ReviewsSection
  
  const [chatTarget, setChatTarget] = React.useState('patients'); // 'patients', 'chws', 'staff', or specific name
  const [chatInput, setChatInput] = React.useState('');

  const [selectedChwId, setSelectedChwId] = React.useState(1);

  // --- Fetch Backend Accounts ---
  React.useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [usersRes, orgsRes, patientsRes, chwsRes] = await Promise.all([
          axios.get('/api/auth/users'),
          axios.get('/api/auth/organizations'),
          axios.get('/api/patients'),
          axios.get('/api/chw')
        ]);
        setUsers(usersRes.data.users || []);
        setOrganizationsCount(orgsRes.data.organizations?.length || 0);
        setPatients(patientsRes.data.patients || []);
        
        const loadedChws = (chwsRes.data.chws || []).map(c => ({
          ...c,
          tasks: c.tasks || []
        }));
        setChws(loadedChws);
        if (loadedChws.length > 0) {
          setSelectedChwId(loadedChws[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const totalUsers = users.length + patients.length;
  const dbStaffCount = users.filter(u => u.role?.toLowerCase() === 'staff').length;
  const adminCount = users.filter(u => u.role?.toLowerCase() === 'admin').length;
  const patientCount = patients.length;

  const activeChw = chws.find(c => c.id === selectedChwId);

  // --- Form Submit Handlers (State-based updates) ---
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.fullname || !newPatient.identity || !newPatient.gender || !newPatient.password || !newPatient.diagnosis || !newPatient.nok_fullname) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const res = await axios.post('/api/patients', newPatient);
      setPatients([res.data.patient, ...patients]);
      setNewPatient({
        fullname: '',
        identity: '',
        gender: 'Male',
        password: '',
        email: '',
        phone_number: '',
        diagnosis: '',
        house_number: '',
        surbub: '',
        municipality: '',
        city: '',
        nok_fullname: '',
        nok_phone: '',
        nok_email: ''
      });
      alert("Patient registered successfully!");
    } catch (err) {
      console.error("Failed to register patient:", err);
      alert(err.response?.data?.message || "Failed to register patient");
    }
  };

  const handleRegisterChw = async (e) => {
    e.preventDefault();
    if (!newChw.employee_id || !newChw.fullname || !newChw.identity || !newChw.password) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const res = await axios.post('/api/chw', newChw);
      const chwToAdd = {
        ...res.data.chw,
        tasks: []
      };
      setChws([chwToAdd, ...chws]);
      setSelectedChwId(chwToAdd.id);
      setNewChw({
        employee_id: '',
        fullname: '',
        identity: '',
        password: '',
        email: '',
        phone_number: ''
      });
      alert("Community Health Worker registered successfully!");
    } catch (err) {
      console.error("Failed to register CHW:", err);
      alert(err.response?.data?.message || "Failed to register CHW");
    }
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.desc || !selectedChwId) return;
    const updatedChws = chws.map(c => {
      if (c.id === selectedChwId) {
        return {
          ...c,
          tasks: [
            {
              id: c.tasks.length + 1,
              title: newTask.title,
              desc: newTask.desc,
              priority: newTask.priority,
              deadline: newTask.deadline || '2026-06-20',
              status: 'Assigned'
            },
            ...c.tasks
          ]
        };
      }
      return c;
    });
    setChws(updatedChws);
    setNewTask({ title: '', desc: '', priority: 'High', deadline: '' });
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!newAppointment.patientName || !newAppointment.staffName || !newAppointment.date) return;
    const appointmentToAdd = {
      id: appointments.length + 1,
      ...newAppointment,
      time: newAppointment.time || '10:00 AM',
      status: 'Scheduled'
    };
    setAppointments([...appointments, appointmentToAdd]);
    setNewAppointment({ patientName: '', staffName: '', date: '', time: '' });
  };

  // handleCreateReview removed to use database reviews in ReviewsSection

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMessage = {
      id: chatMessages.length + 1,
      sender: "Admin (" + user.fullname + ")",
      recipient: chatTarget,
      message: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const handleStaffAvailability = (id, newAvailability) => {
    const updatedStaff = staff.map(s => {
      if (s.id === id) {
        return { ...s, availability: newAvailability };
      }
      return s;
    });
    setStaff(updatedStaff);
  };

  // --- Sidebar Items ---
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'patients', label: 'Patients', icon: <FaUsers /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'chw', label: 'Comm. Health Worker', icon: <FaRunning /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'staff', label: 'Staff Directory', icon: <FaUserMd /> },
    { id: 'reviews', label: 'Website Reviews', icon: <FaStar /> },
    { id: 'chat', label: 'Chat Room', icon: <FaComments /> },
  ];

  return (
    <div className='min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      {/* Sidebar */}
      <aside className='w-full md:w-64 bg-[#090b0d] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 shrink-0 relative z-20 justify-between'>
        <div>
          {/* Logo / Brand */}
          <div className='flex items-center gap-2 mb-8'>
            <div className='bg-violet-500 text-black p-1.5 rounded-lg font-bold flex items-center justify-center'>
              <FaHeartbeat size={18} />
            </div>
            <span className='text-lg font-black tracking-tight text-white'>
              Ubuntu<span className='text-violet-500'>Health</span>
            </span>
          </div>

          {/* Admin Portal Tag */}
          <div className='bg-violet-500/10 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase mb-6 flex items-center gap-2'>
            <FaShieldAlt />
            <span>Admin Portal</span>
          </div>

          {/* Navigation Links */}
          <nav className='space-y-1.5'>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 text-left ${
                  activeTab === item.id 
                    ? 'bg-violet-500 text-black shadow-lg shadow-violet-500/10' 
                    : 'bg-white/5 hover:bg-violet-500/10 text-gray-400 hover:text-violet-400 border border-transparent hover:border-violet-500/20'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout at Bottom */}
        <button 
          onClick={handleLogout} 
          className='cursor-pointer flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 px-5 py-3 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-95 mt-8 text-gray-400 hover:text-red-400'
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className='flex-1 p-6 md:p-12 overflow-y-auto relative z-10'>
        {activeTab === 'overview' && (
          <div className='max-w-6xl mx-auto'>
            {/* Header */}
            <header className='mb-12 pb-6 border-b border-violet-500/20'>
              <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, Admin {user.fullname}</h1>
              <p className='text-gray-400 text-sm mt-1'>Org: {user.organization || 'Cape Town Clinic'}</p>
            </header>

            {/* Quick Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
              {[
                { label: 'Total Accounts', value: loading ? '...' : totalUsers, icon: <FaUsers className='text-violet-400' />, desc: `${patientCount} Patients` },
                { label: 'Staff Registered', value: loading ? '...' : dbStaffCount, icon: <FaUserMd className='text-fuchsia-400' />, desc: 'Clinical workers' },
                { label: 'System Admins', value: loading ? '...' : adminCount, icon: <FaUser className='text-pink-400' />, desc: 'Portal controllers' },
                { label: 'Active Organizations', value: loading ? '...' : organizationsCount, icon: <FaClipboardList className='text-purple-400' />, desc: 'System-wide nodes' }
              ].map((stat, idx) => (
                <div key={idx} className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-violet-500/30 hover:scale-[1.02] transition-all duration-300'>
                  <div className='flex justify-between items-start mb-4'>
                    <span className='text-gray-400 text-sm font-medium'>{stat.label}</span>
                    <div className='bg-white/5 p-2 rounded-lg'>{stat.icon}</div>
                  </div>
                  <div className='text-3xl font-bold mb-1'>{stat.value}</div>
                  <span className='text-xs text-gray-500'>{stat.desc}</span>
                </div>
              ))}
            </div>

            {/* User Directory */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6'>
                <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
                  <FaUsers className='text-violet-400' />
                  Platform Accounts Directory
                </h2>
                {loading ? (
                  <div className='text-center py-12 text-gray-500 text-sm'>
                    Loading user logs...
                  </div>
                ) : (
                  <div className='space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
                    {users.map((profile, idx) => (
                      <div key={idx} className='flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300'>
                        <div>
                          <div className='flex items-center gap-2 mb-0.5'>
                            <h3 className='font-semibold text-sm'>{profile.fullname}</h3>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                              profile.role === 'admin' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' :
                              profile.role === 'staff' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {profile.role || 'patient'}
                            </span>
                          </div>
                          <p className='text-[10px] text-gray-500'>ID: {profile.identity?.trim()}</p>
                          {profile.organization && <p className='text-[10px] text-violet-300 mt-1'>Org: {profile.organization}</p>}
                        </div>
                        <div className='text-right text-[11px] text-gray-400'>
                          <p>{profile.email || 'No email'}</p>
                          <p className='mt-0.5'>{profile.phone_number?.trim()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Utility sidebar */}
              <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
                <h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
                  <FaShieldAlt className='text-fuchsia-400' />
                  Quick Audits
                </h2>
                <div className='space-y-2.5'>
                  {['Role Configuration', 'Audit Database Logs', 'System Analytics'].map((tool, idx) => (
                    <button key={idx} className='cursor-pointer w-full text-left bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/20 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-300'>
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Patients Section --- */}
        {activeTab === 'patients' && (
          <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6'>
              <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
                <FaUsers className='text-violet-400' />
                Patients for {user.organization || 'Cape Town Clinic'}
              </h2>
              <div className='space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
                {patients.length === 0 ? (
                  <div className='text-center py-12 text-gray-500 text-sm'>
                    No registered patients found.
                  </div>
                ) : (
                  patients.map(p => (
                    <div key={p.id} className='bg-white/5 border border-white/5 hover:border-violet-500/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                      <div className='flex-1 pr-2 text-left'>
                        <h3 className='font-bold text-sm text-violet-300'>{p.fullname}</h3>
                        <p className='text-xs text-gray-300 mt-1'><span className='font-semibold text-gray-400'>Identity:</span> {p.identity} | <span className='font-semibold text-gray-400'>Gender:</span> {p.gender}</p>
                        <p className='text-xs text-gray-300 mt-0.5'><span className='font-semibold text-gray-400'>Diagnosis:</span> {p.diagnosis}</p>
                        {(p.house_number || p.surbub || p.city) && (
                          <p className='text-[11px] text-gray-400 mt-1'><span className='font-semibold text-gray-500'>Address:</span> {p.house_number || ''} {p.surbub || ''} {p.city || ''}</p>
                        )}
                        <p className='text-[11px] text-gray-400 mt-1'><span className='font-semibold text-gray-500'>Next of Kin:</span> {p.nok_fullname} {p.nok_phone ? `(${p.nok_phone})` : ''}</p>
                      </div>
                      <div className='text-right text-xs text-gray-400 shrink-0 md:border-l md:border-white/5 md:pl-4'>
                        <p className='font-medium text-gray-300'>{p.phone_number || 'No Phone'}</p>
                        <p className='mt-0.5 text-gray-400'>{p.email || 'No Email'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit overflow-y-auto max-h-[85vh] custom-scrollbar'>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-4 sticky top-0 bg-[#0c0f13] py-2 z-10'>
                <FaPlusCircle className='text-fuchsia-400' />
                Register New Patient
              </h2>
              <form onSubmit={handleRegisterPatient} className='space-y-4 text-left'>
                
                {/* --- Section 1: Core Details --- */}
                <div className='space-y-3.5'>
                  <h3 className='text-[10px] font-bold text-violet-400 uppercase tracking-wider border-b border-white/5 pb-1'>1. Core Profile</h3>
                  
                  <div>
                    <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Full Name <span className='text-red-400'>*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sipho Nkosi" 
                      value={newPatient.fullname} 
                      onChange={e => setNewPatient({ ...newPatient, fullname: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>ID Number <span className='text-red-400'>*</span></label>
                      <input 
                        type="text" 
                        placeholder="13-digit SA ID" 
                        value={newPatient.identity} 
                        onChange={e => setNewPatient({ ...newPatient, identity: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Gender <span className='text-red-400'>*</span></label>
                      <select 
                        value={newPatient.gender} 
                        onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })} 
                        className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                        required
                      >
                        <option value="Male" className='bg-slate-900'>Male</option>
                        <option value="Female" className='bg-slate-900'>Female</option>
                        <option value="Other" className='bg-slate-900'>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Portal Password <span className='text-red-400'>*</span></label>
                      <input 
                        type="password" 
                        placeholder="Password for login" 
                        value={newPatient.password} 
                        onChange={e => setNewPatient({ ...newPatient, password: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Diagnosis <span className='text-red-400'>*</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. Chronic Hypertension" 
                        value={newPatient.diagnosis} 
                        onChange={e => setNewPatient({ ...newPatient, diagnosis: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="patient@gmail.com" 
                        value={newPatient.email} 
                        onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 0712345678" 
                        value={newPatient.phone_number} 
                        onChange={e => setNewPatient({ ...newPatient, phone_number: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      />
                    </div>
                  </div>
                </div>

                {/* --- Section 2: Residential Address --- */}
                <div className='space-y-3.5 pt-2'>
                  <h3 className='text-[10px] font-bold text-violet-400 uppercase tracking-wider border-b border-white/5 pb-1'>2. Location Details</h3>
                  
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>House Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Room 4 / 12" 
                        value={newPatient.house_number} 
                        onChange={e => setNewPatient({ ...newPatient, house_number: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Surbub</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Khayelitsha" 
                        value={newPatient.surbub} 
                        onChange={e => setNewPatient({ ...newPatient, surbub: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Municipality</label>
                      <input 
                        type="text" 
                        placeholder="e.g. City of Cape Town" 
                        value={newPatient.municipality} 
                        onChange={e => setNewPatient({ ...newPatient, municipality: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Cape Town" 
                        value={newPatient.city} 
                        onChange={e => setNewPatient({ ...newPatient, city: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      />
                    </div>
                  </div>
                </div>

                {/* --- Section 3: Next of Kin --- */}
                <div className='space-y-3.5 pt-2'>
                  <h3 className='text-[10px] font-bold text-violet-400 uppercase tracking-wider border-b border-white/5 pb-1'>3. Next of Kin</h3>
                  
                  <div>
                    <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Full Name <span className='text-red-400'>*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. Nomvula Nkosi" 
                      value={newPatient.nok_fullname} 
                      onChange={e => setNewPatient({ ...newPatient, nok_fullname: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 0823456789" 
                        value={newPatient.nok_phone} 
                        onChange={e => setNewPatient({ ...newPatient, nok_phone: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="nok@example.com" 
                        value={newPatient.nok_email} 
                        onChange={e => setNewPatient({ ...newPatient, nok_email: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-3 rounded-xl transition-all duration-300 text-xs mt-4 hover:scale-[1.01] active:scale-95 shadow-lg shadow-violet-500/25'>
                  Register Patient Profile
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- Referrals Section --- */}
        {activeTab === 'referrals' && (
          <ReferralsSection user={user} />
        )}

        {/* --- Community Health Workers Section --- */}
        {activeTab === 'chw' && (
          <div className='max-w-6xl mx-auto space-y-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* CHW List */}
              <div className='lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6'>
                <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
                  <FaRunning className='text-violet-400' />
                  Community Health Workers Outreach Team
                </h2>
                <div className='space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
                  {chws.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedChwId(c.id)}
                      className={`cursor-pointer bg-white/5 border rounded-xl p-4 transition-all duration-300 flex justify-between items-center ${
                        selectedChwId === c.id ? 'border-violet-500 bg-white/10' : 'border-white/5 hover:border-violet-500/20'
                      }`}
                    >
                      <div className='text-left'>
                        <h3 className='font-bold text-sm text-violet-300'>{c.fullname}</h3>
                        <p className='text-xs text-gray-400'>Identity: {c.identity} | Employee ID: <span className='text-violet-300'>{c.employee_id}</span></p>
                        {c.tasks && c.tasks.length > 0 && (
                          <p className='text-[10px] text-fuchsia-300 mt-1 font-medium'>
                            Latest Task: "{c.tasks[0].title}" ({c.tasks[0].status})
                          </p>
                        )}
                      </div>
                      <div className='text-right text-xs text-gray-500'>
                        <p>{c.phone_number || 'No Phone'}</p>
                        <p>{c.email || 'No Email'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Register CHW Form */}
              <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
                <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                  <FaPlusCircle className='text-fuchsia-400' />
                  Register CHW
                </h2>
                <form onSubmit={handleRegisterChw} className='space-y-3.5 text-left'>
                  <div>
                    <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Employee ID <span className='text-red-400'>*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. CHW-2026-904" 
                      value={newChw.employee_id} 
                      onChange={e => setNewChw({ ...newChw, employee_id: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Full Name <span className='text-red-400'>*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sizwe Dube" 
                      value={newChw.fullname} 
                      onChange={e => setNewChw({ ...newChw, fullname: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      required
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>SA ID Number <span className='text-red-400'>*</span></label>
                      <input 
                        type="text" 
                        placeholder="13-digit SA ID" 
                        value={newChw.identity} 
                        onChange={e => setNewChw({ ...newChw, identity: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Portal Password <span className='text-red-400'>*</span></label>
                      <input 
                        type="password" 
                        placeholder="Password for login" 
                        value={newChw.password} 
                        onChange={e => setNewChw({ ...newChw, password: e.target.value })} 
                        className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="chw@ubuntuhealth.org" 
                      value={newChw.email} 
                      onChange={e => setNewChw({ ...newChw, email: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                    />
                  </div>
                  <div>
                    <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Phone Number (10 digits)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 0731112222" 
                      value={newChw.phone_number} 
                      onChange={e => setNewChw({ ...newChw, phone_number: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                    />
                  </div>
                  <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-2.5 rounded-xl transition-all duration-300 text-xs mt-2'>
                    Register CHW Profile
                  </button>
                </form>
              </div>
            </div>

            {/* Selected CHW task details & Task Assignment */}
            {activeChw && (
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-white/5 pt-8'>
                {/* Historical tasks */}
                <div className='lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6'>
                  <h3 className='text-lg font-bold flex items-center gap-2 mb-4'>
                    <FaClipboardList className='text-violet-400' />
                    Outreach Task Log: {activeChw.fullname}
                  </h3>
                  {activeChw.tasks.length === 0 ? (
                    <div className='text-center py-10 text-gray-500 text-xs'>
                      No tasks assigned yet.
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {activeChw.tasks.map(t => (
                        <div key={t.id} className='bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-start'>
                          <div>
                            <h4 className='font-semibold text-sm text-gray-200'>{t.title}</h4>
                            <p className='text-xs text-gray-400 mt-1'>{t.desc}</p>
                            <p className='text-[10px] text-gray-500 mt-2'>Deadline: {t.deadline}</p>
                          </div>
                          <div className='text-right'>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              t.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>{t.priority}</span>
                            <span className={`block text-[10px] font-semibold mt-2 ${
                              t.status === 'Completed' ? 'text-emerald-400' : 'text-violet-400'
                            }`}>{t.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assign Task form */}
                <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
                  <h3 className='text-lg font-bold flex items-center gap-2 mb-4'>
                    <FaPlusCircle className='text-fuchsia-400' />
                    Assign New Task
                  </h3>
                  <form onSubmit={handleAssignTask} className='space-y-4'>
                    <input 
                      type="text" 
                      placeholder="Task Title" 
                      value={newTask.title} 
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      required
                    />
                    <textarea 
                      placeholder="Task Description" 
                      value={newTask.desc} 
                      onChange={e => setNewTask({ ...newTask, desc: e.target.value })} 
                      className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs resize-none h-20' 
                      required
                    ></textarea>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className='block text-[9px] uppercase font-bold text-gray-500 mb-1'>Priority</label>
                        <select 
                          value={newTask.priority} 
                          onChange={e => setNewTask({ ...newTask, priority: e.target.value })} 
                          className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs'
                        >
                          <option value="High" className='bg-slate-900'>High</option>
                          <option value="Medium" className='bg-slate-900'>Medium</option>
                          <option value="Low" className='bg-slate-900'>Low</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-[9px] uppercase font-bold text-gray-500 mb-1'>Deadline</label>
                        <input 
                          type="date" 
                          value={newTask.deadline} 
                          onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} 
                          className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs' 
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-2.5 rounded-xl transition-all duration-300 text-xs mt-2'>
                      Assign Task
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        {/* --- Appointments Section --- */}
        {activeTab === 'appointments' && (
          <AppointmentsSection user={user} />
        )}

        {/* --- Staff Section --- */}
        {activeTab === 'staff' && (
          <div className='max-w-6xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6'>
            <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
              <FaUserMd className='text-violet-400' />
              Staff Profiles Directory & Availability Control
            </h2>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs border-collapse'>
                <thead>
                  <tr className='border-b border-white/10 text-gray-400 font-semibold'>
                    <th className='pb-3'>Staff Name</th>
                    <th className='pb-3'>Role/Specialization</th>
                    <th className='pb-3'>Email</th>
                    <th className='pb-3'>Phone</th>
                    <th className='pb-3'>Availability</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-white/5'>
                  {staff.map(s => (
                    <tr key={s.id} className='hover:bg-white/5'>
                      <td className='py-3.5 font-semibold'>{s.fullname}</td>
                      <td className='py-3.5 text-gray-300'>{s.role}</td>
                      <td className='py-3.5 text-gray-400'>{s.email}</td>
                      <td className='py-3.5 text-gray-400'>{s.phone_number}</td>
                      <td className='py-3.5'>
                        <select 
                          value={s.availability} 
                          onChange={e => handleStaffAvailability(s.id, e.target.value)} 
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold focus:outline-none cursor-pointer ${
                            s.availability === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            s.availability === 'On Duty' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            s.availability === 'On Leave' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          <option value="Available" className='bg-slate-900 text-emerald-400'>Available</option>
                          <option value="On Duty" className='bg-slate-900 text-blue-400'>On Duty</option>
                          <option value="Off Duty" className='bg-slate-900 text-amber-400'>Off Duty</option>
                          <option value="On Leave" className='bg-slate-900 text-red-400'>On Leave</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Reviews Section --- */}
        {activeTab === 'reviews' && (
          <ReviewsSection user={user} />
        )}

        {/* --- Chat Room Section --- */}
        {activeTab === 'chat' && (
          <div className='max-w-6xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 h-[550px]'>
            {/* Left selector */}
            <div className='w-full md:w-64 bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col justify-between shrink-0'>
              <div>
                <h3 className='text-sm font-bold flex items-center gap-1.5 mb-4 text-violet-400 border-b border-white/5 pb-2'>
                  <FaComments />
                  Chat Targeting
                </h3>
                <div className='space-y-2.5'>
                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider'>Send broadcast to:</label>
                    <div className='flex flex-col gap-1.5'>
                      {['patients', 'chws', 'staff'].map(target => (
                        <button 
                          key={target}
                          onClick={() => setChatTarget(target)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold capitalize border transition-all duration-300 ${
                            chatTarget === target ? 'bg-violet-500 text-black border-violet-500' : 'bg-white/5 text-gray-400 border-white/5 hover:border-violet-500/20'
                          }`}
                        >
                          All {target}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='h-px bg-white/5 my-3'></div>

                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider'>Send private to:</label>
                    <select 
                      value={['patients', 'chws', 'staff'].includes(chatTarget) ? '' : chatTarget} 
                      onChange={e => setChatTarget(e.target.value)} 
                      className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs'
                    >
                      <option value="" disabled>Select Recipient</option>
                      <optgroup label="Patients" className='bg-slate-900'>
                        {patients.map(p => <option key={`pat-${p.id}`} value={p.fullname}>{p.fullname}</option>)}
                      </optgroup>
                      <optgroup label="CHWs" className='bg-slate-900'>
                        {chws.map(c => <option key={`chw-${c.id}`} value={c.fullname}>{c.fullname}</option>)}
                      </optgroup>
                      <optgroup label="Staff" className='bg-slate-900'>
                        {staff.map(s => <option key={`stf-${s.id}`} value={s.fullname}>{s.fullname}</option>)}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              <div className='bg-white/5 border border-white/5 rounded-xl p-3 text-[10px] text-gray-500'>
                Targeting: <span className='text-violet-400 font-bold capitalize'>{chatTarget}</span>
              </div>
            </div>

            {/* Right Chat logs */}
            <div className='flex-1 flex flex-col justify-between h-full bg-black/20 border border-white/5 rounded-xl p-4'>
              <div className='flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[420px]'>
                {chatMessages.filter(m => m.recipient === 'All' || m.recipient === chatTarget || m.sender.includes(chatTarget)).map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[80%] rounded-xl p-3 ${
                      msg.sender.includes("Admin") 
                        ? 'bg-violet-600/30 border border-violet-500/20 self-end ml-auto' 
                        : 'bg-white/5 border border-white/5 self-start mr-auto'
                    }`}
                  >
                    <div className='flex justify-between items-center gap-4 mb-1'>
                      <span className='text-[10px] font-bold text-violet-300'>{msg.sender}</span>
                      <span className='text-[9px] text-gray-500'>{msg.timestamp}</span>
                    </div>
                    <p className='text-xs text-gray-200 leading-relaxed'>{msg.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} className='flex gap-2 mt-4 pt-3 border-t border-white/5'>
                <input 
                  type="text" 
                  placeholder={`Send message to ${chatTarget}...`}
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  className='flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                  required
                />
                <button type="submit" className='cursor-pointer bg-violet-500 hover:bg-violet-600 text-black p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center'>
                  <FaPaperPlane size={14} />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Main Dashboard Dispatcher ---
const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout'); // Sending the logout request to the backend
      setUser(null); // Clear the user session state
      localStorage.removeItem('user'); // Clear local storage
      navigate('/'); // Redirect to home page
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-900 text-white'>
        <div className='text-center'>
          <p className='text-gray-400 mb-4'>Please log in to view the dashboard.</p>
          <button 
            onClick={() => navigate('/')} 
            className='bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300'
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const role = user.role?.toLowerCase();

  if (role === 'admin') {
    return <AdminDashboard user={user} handleLogout={handleLogout} />;
  } else if (role === 'staff') {
    return <StaffDashboard user={user} handleLogout={handleLogout} />;
  } else if (role === 'chw') {
    return <ChwDashboard user={user} handleLogout={handleLogout} />;
  } else {
    // Default to Patient Dashboard if role is 'patient' or unspecified
    return <PatientDashboard user={user} handleLogout={handleLogout} />;
  }
};

export default Dashboard;