// ============= Dashboard Component with Role-Based Views and Premium Aesthetics =============
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    { id: 'telehealth', label: 'Telehealth', icon: <FaHeartbeat /> },
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
    { id: 'prescriptions', label: 'Prescriptions', icon: <FaPrescriptionBottle /> },
    { id: 'registry', label: 'Medical Registry', icon: <FaFileMedicalAlt /> },
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
    { id: 'outreach', label: 'Outreach Events', icon: <FaCalendarAlt /> },
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

// --- Admin Dashboard Component ---
const AdminDashboard = ({ user, handleLogout }) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [organizationsCount, setOrganizationsCount] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('overview');

  // --- Mock Databases for Admin Features ---
  const [patients, setPatients] = React.useState([
    { id: 1, fullname: "Thabo Cele", identity: "9508125432087", phone_number: "0711234567", email: "thabo@cele.co.za", gender: "Male", age: 31, organization: user.organization },
    { id: 2, fullname: "Nomvula Khumalo", identity: "8804030987182", phone_number: "0829876543", email: "nomvula@khumalo.org", gender: "Female", age: 38, organization: user.organization },
    { id: 3, fullname: "Johan Botha", identity: "7011225091083", phone_number: "0605551234", email: "johan@botha.net", gender: "Male", age: 55, organization: user.organization }
  ]);

  const [referrals, setReferrals] = React.useState([
    { id: 1, patientName: "Thabo Cele", reason: "Cardiac consultation follow-up", source: "Mitchells Plain Clinic", destination: user.organization || "Cape Town Clinic", status: "Pending", type: "Incoming" },
    { id: 2, patientName: "Nomvula Khumalo", reason: "Advanced Diabetic Retinopathy screening", source: user.organization || "Cape Town Clinic", destination: "Tygerberg Academic Hospital", status: "Accepted", type: "Outgoing" }
  ]);

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

  const [reviews, setReviews] = React.useState([
    { id: 1, rating: 5, comment: "Excellent speed in registering and assigning tasks to workers!", date: "2026-06-12" },
    { id: 2, rating: 4, comment: "Very clean dark theme and responsive navigation layouts.", date: "2026-06-13" }
  ]);

  const [chatMessages, setChatMessages] = React.useState([
    { id: 1, sender: "System", recipient: "All", message: "Welcome to the UbuntuHealth Admin Chat Room. Select a target group or contact to start.", timestamp: "16:00" }
  ]);

  // --- Form Input States ---
  const [newPatient, setNewPatient] = React.useState({ fullname: '', identity: '', phone_number: '', email: '', gender: 'Male', age: '' });
  const [newReferral, setNewReferral] = React.useState({ patientName: '', reason: '', source: '', destination: '', type: 'Incoming' });
  const [newChw, setNewChw] = React.useState({ fullname: '', identity: '', phone_number: '', email: '', area: '' });
  const [newTask, setNewTask] = React.useState({ title: '', desc: '', priority: 'High', deadline: '' });
  const [newAppointment, setNewAppointment] = React.useState({ patientName: '', staffName: '', date: '', time: '' });
  const [newReview, setNewReview] = React.useState({ rating: 5, comment: '' });
  
  const [chatTarget, setChatTarget] = React.useState('patients'); // 'patients', 'chws', 'staff', or specific name
  const [chatInput, setChatInput] = React.useState('');

  const [selectedChwId, setSelectedChwId] = React.useState(1);

  // --- Fetch Backend Accounts ---
  React.useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [usersRes, orgsRes] = await Promise.all([
          axios.get('/api/auth/users'),
          axios.get('/api/auth/organizations')
        ]);
        setUsers(usersRes.data.users || []);
        setOrganizationsCount(orgsRes.data.organizations?.length || 0);
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const totalUsers = users.length;
  const dbStaffCount = users.filter(u => u.role?.toLowerCase() === 'staff').length;
  const adminCount = users.filter(u => u.role?.toLowerCase() === 'admin').length;
  const patientCount = users.filter(u => u.role?.toLowerCase() === 'patient' || !u.role).length;

  const activeChw = chws.find(c => c.id === selectedChwId);

  // --- Form Submit Handlers (State-based updates) ---
  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatient.fullname || !newPatient.identity || !newPatient.phone_number) return;
    const patientToAdd = {
      id: patients.length + 1,
      ...newPatient,
      age: parseInt(newPatient.age) || 30,
      organization: user.organization
    };
    setPatients([...patients, patientToAdd]);
    setNewPatient({ fullname: '', identity: '', phone_number: '', email: '', gender: 'Male', age: '' });
  };

  const handleCreateReferral = (e) => {
    e.preventDefault();
    if (!newReferral.patientName || !newReferral.reason) return;
    const referralToAdd = {
      id: referrals.length + 1,
      ...newReferral,
      source: newReferral.type === 'Incoming' ? newReferral.source : (user.organization || 'Cape Town Clinic'),
      destination: newReferral.type === 'Outgoing' ? newReferral.destination : (user.organization || 'Cape Town Clinic'),
      status: 'Pending'
    };
    setReferrals([...referrals, referralToAdd]);
    setNewReferral({ patientName: '', reason: '', source: '', destination: '', type: 'Incoming' });
  };

  const handleRegisterChw = (e) => {
    e.preventDefault();
    if (!newChw.fullname || !newChw.identity || !newChw.area) return;
    const chwToAdd = {
      id: chws.length + 1,
      ...newChw,
      tasks: []
    };
    setChws([...chws, chwToAdd]);
    setNewChw({ fullname: '', identity: '', phone_number: '', email: '', area: '' });
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

  const handleCreateReview = (e) => {
    e.preventDefault();
    if (!newReview.comment) return;
    const reviewToAdd = {
      id: reviews.length + 1,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews([reviewToAdd, ...reviews]);
    setNewReview({ rating: 5, comment: '' });
  };

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
                {patients.map(p => (
                  <div key={p.id} className='bg-white/5 border border-white/5 hover:border-violet-500/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex justify-between items-center'>
                    <div>
                      <h3 className='font-bold text-sm'>{p.fullname}</h3>
                      <p className='text-xs text-gray-500'>ID: {p.identity} | Age: {p.age} | {p.gender}</p>
                    </div>
                    <div className='text-right text-xs text-gray-400'>
                      <p>{p.phone_number}</p>
                      <p className='mt-0.5'>{p.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                <FaPlusCircle className='text-fuchsia-400' />
                Register New Patient
              </h2>
              <form onSubmit={handleRegisterPatient} className='space-y-3.5'>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={newPatient.fullname} 
                  onChange={e => setNewPatient({ ...newPatient, fullname: e.target.value })} 
                  className='w-full px-4.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 text-xs' 
                  required
                />
                <input 
                  type="text" 
                  placeholder="ID Number (13 digits)" 
                  value={newPatient.identity} 
                  onChange={e => setNewPatient({ ...newPatient, identity: e.target.value })} 
                  className='w-full px-4.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 text-xs' 
                  required
                />
                <input 
                  type="text" 
                  placeholder="Phone Number" 
                  value={newPatient.phone_number} 
                  onChange={e => setNewPatient({ ...newPatient, phone_number: e.target.value })} 
                  className='w-full px-4.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 text-xs' 
                  required
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={newPatient.email} 
                  onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} 
                  className='w-full px-4.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 text-xs' 
                />
                <div className='grid grid-cols-2 gap-2'>
                  <select 
                    value={newPatient.gender} 
                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })} 
                    className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                  >
                    <option value="Male" className='bg-slate-900'>Male</option>
                    <option value="Female" className='bg-slate-900'>Female</option>
                    <option value="Other" className='bg-slate-900'>Other</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Age" 
                    value={newPatient.age} 
                    onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} 
                    className='w-full px-4.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 text-xs' 
                    required
                  />
                </div>
                <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-2.5 rounded-xl transition-all duration-300 text-xs mt-2'>
                  Register Patient
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- Referrals Section --- */}
        {activeTab === 'referrals' && (
          <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 space-y-6'>
              {/* Incoming table */}
              <div className='bg-white/5 border border-white/10 rounded-2xl p-6'>
                <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                  <FaExchangeAlt className='text-violet-400' />
                  Incoming Referrals
                </h2>
                <div className='overflow-x-auto'>
                  <table className='w-full text-left text-xs border-collapse'>
                    <thead>
                      <tr className='border-b border-white/10 text-gray-400 font-semibold'>
                        <th className='pb-3'>Patient</th>
                        <th className='pb-3'>Reason</th>
                        <th className='pb-3'>Source Node</th>
                        <th className='pb-3'>Status</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-white/5'>
                      {referrals.filter(r => r.type === 'Incoming').map(r => (
                        <tr key={r.id} className='hover:bg-white/5'>
                          <td className='py-3 font-semibold'>{r.patientName}</td>
                          <td className='py-3 text-gray-300'>{r.reason}</td>
                          <td className='py-3 text-gray-400'>{r.source}</td>
                          <td className='py-3'>
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              r.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Outgoing table */}
              <div className='bg-white/5 border border-white/10 rounded-2xl p-6'>
                <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                  <FaExchangeAlt className='text-fuchsia-400' />
                  Outgoing Referrals
                </h2>
                <div className='overflow-x-auto'>
                  <table className='w-full text-left text-xs border-collapse'>
                    <thead>
                      <tr className='border-b border-white/10 text-gray-400 font-semibold'>
                        <th className='pb-3'>Patient</th>
                        <th className='pb-3'>Reason</th>
                        <th className='pb-3'>Destination</th>
                        <th className='pb-3'>Status</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-white/5'>
                      {referrals.filter(r => r.type === 'Outgoing').map(r => (
                        <tr key={r.id} className='hover:bg-white/5'>
                          <td className='py-3 font-semibold'>{r.patientName}</td>
                          <td className='py-3 text-gray-300'>{r.reason}</td>
                          <td className='py-3 text-gray-400'>{r.destination}</td>
                          <td className='py-3'>
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              r.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Create Referral Form */}
            <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                <FaPlusCircle className='text-fuchsia-400' />
                Create Referral Log
              </h2>
              <form onSubmit={handleCreateReferral} className='space-y-4'>
                <div>
                  <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider'>Type</label>
                  <select 
                    value={newReferral.type} 
                    onChange={e => setNewReferral({ ...newReferral, type: e.target.value })} 
                    className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs'
                  >
                    <option value="Incoming" className='bg-slate-900'>Incoming</option>
                    <option value="Outgoing" className='bg-slate-900'>Outgoing</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  placeholder="Patient Name" 
                  value={newReferral.patientName} 
                  onChange={e => setNewReferral({ ...newReferral, patientName: e.target.value })} 
                  className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                  required
                />
                <input 
                  type="text" 
                  placeholder="Reason for Referral" 
                  value={newReferral.reason} 
                  onChange={e => setNewReferral({ ...newReferral, reason: e.target.value })} 
                  className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                  required
                />
                {newReferral.type === 'Incoming' ? (
                  <input 
                    type="text" 
                    placeholder="Originating Clinic/Hospital" 
                    value={newReferral.source} 
                    onChange={e => setNewReferral({ ...newReferral, source: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                    required
                  />
                ) : (
                  <input 
                    type="text" 
                    placeholder="Destination Hospital" 
                    value={newReferral.destination} 
                    onChange={e => setNewReferral({ ...newReferral, destination: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                    required
                  />
                )}
                <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-2.5 rounded-xl transition-all duration-300 text-xs mt-2'>
                  Submit Referral
                </button>
              </form>
            </div>
          </div>
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
                      <div>
                        <h3 className='font-bold text-sm'>{c.fullname}</h3>
                        <p className='text-xs text-gray-400'>Identity: {c.identity} | Area: <span className='text-violet-300'>{c.area}</span></p>
                        {c.tasks.length > 0 && (
                          <p className='text-[10px] text-fuchsia-300 mt-1 font-medium'>
                            Latest Task: "{c.tasks[0].title}" ({c.tasks[0].status})
                          </p>
                        )}
                      </div>
                      <div className='text-right text-xs text-gray-500'>
                        <p>{c.phone_number}</p>
                        <p>{c.email}</p>
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
                <form onSubmit={handleRegisterChw} className='space-y-3.5'>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={newChw.fullname} 
                    onChange={e => setNewChw({ ...newChw, fullname: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="ID Number (13 digits)" 
                    value={newChw.identity} 
                    onChange={e => setNewChw({ ...newChw, identity: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Phone Number" 
                    value={newChw.phone_number} 
                    onChange={e => setNewChw({ ...newChw, phone_number: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="Email (Optional)" 
                    value={newChw.email} 
                    onChange={e => setNewChw({ ...newChw, email: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                  />
                  <input 
                    type="text" 
                    placeholder="Assigned Outreach Area" 
                    value={newChw.area} 
                    onChange={e => setNewChw({ ...newChw, area: e.target.value })} 
                    className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                    required
                  />
                  <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-2.5 rounded-xl transition-all duration-300 text-xs mt-2'>
                    Register CHW
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
          <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6'>
              <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
                <FaCalendarAlt className='text-violet-400' />
                Organization Appointments
              </h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-xs border-collapse'>
                  <thead>
                    <tr className='border-b border-white/10 text-gray-400 font-semibold'>
                      <th className='pb-3'>Patient</th>
                      <th className='pb-3'>Assigned Doctor</th>
                      <th className='pb-3'>Date</th>
                      <th className='pb-3'>Time</th>
                      <th className='pb-3'>Status</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-white/5'>
                    {appointments.map(app => (
                      <tr key={app.id} className='hover:bg-white/5'>
                        <td className='py-3 font-semibold'>{app.patientName}</td>
                        <td className='py-3 text-gray-300'>{app.staffName}</td>
                        <td className='py-3 text-gray-400'>{app.date}</td>
                        <td className='py-3 text-gray-400'>{app.time}</td>
                        <td className='py-3'>
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`}>{app.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Appointment form */}
            <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                <FaPlusCircle className='text-fuchsia-400' />
                Schedule Appointment
              </h2>
              <form onSubmit={handleCreateAppointment} className='space-y-4'>
                <input 
                  type="text" 
                  placeholder="Patient Name" 
                  value={newAppointment.patientName} 
                  onChange={e => setNewAppointment({ ...newAppointment, patientName: e.target.value })} 
                  className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                  required
                />
                <select 
                  value={newAppointment.staffName} 
                  onChange={e => setNewAppointment({ ...newAppointment, staffName: e.target.value })} 
                  className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs'
                  required
                >
                  <option value="" disabled className='bg-slate-900'>Select Doctor/Staff</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.fullname} className='bg-slate-900'>{s.fullname} ({s.role})</option>
                  ))}
                </select>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='block text-[9px] uppercase font-bold text-gray-500 mb-1'>Date</label>
                    <input 
                      type="date" 
                      value={newAppointment.date} 
                      onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })} 
                      className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs' 
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-[9px] uppercase font-bold text-gray-500 mb-1'>Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 10:30 AM" 
                      value={newAppointment.time} 
                      onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })} 
                      className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                      required
                    />
                  </div>
                </div>
                <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-2.5 rounded-xl transition-all duration-300 text-xs mt-2'>
                  Schedule
                </button>
              </form>
            </div>
          </div>
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
          <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6'>
              <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
                <FaStar className='text-violet-400' />
                My Reviews & Feedback Log
              </h2>
              <div className='space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
                {reviews.map(r => (
                  <div key={r.id} className='bg-white/5 border border-white/5 rounded-xl p-4'>
                    <div className='flex justify-between items-center mb-2'>
                      <div className='flex items-center gap-1'>
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < r.rating ? 'text-yellow-500' : 'text-gray-700'} size={12} />
                        ))}
                      </div>
                      <span className='text-[10px] text-gray-500'>{r.date}</span>
                    </div>
                    <p className='text-xs text-gray-300 italic'>"{r.comment}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Create review form */}
            <div className='bg-white/5 border border-white/10 rounded-2xl p-6 h-fit'>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-4'>
                <FaPlusCircle className='text-fuchsia-400' />
                Write Web Feedback
              </h2>
              <form onSubmit={handleCreateReview} className='space-y-4'>
                <div>
                  <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider'>Rating Stars</label>
                  <select 
                    value={newReview.rating} 
                    onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value) })} 
                    className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs'
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num} className='bg-slate-900'>{num} Stars</option>
                    ))}
                  </select>
                </div>
                <textarea 
                  placeholder="Your comments or review about the website system..." 
                  value={newReview.comment} 
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })} 
                  className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs resize-none h-28' 
                  required
                ></textarea>
                <button type="submit" className='cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-black font-extrabold py-2.5 rounded-xl transition-all duration-300 text-xs mt-2'>
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
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