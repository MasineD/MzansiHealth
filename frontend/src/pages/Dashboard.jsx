// ============= Dashboard Component with Role-Based Views and Premium Aesthetics =============
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { io } from 'socket.io-client';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck
} from 'react-icons/fa';
// Importing all the necessary components
import ReviewsSection from '../components/dashboards/sections/ReviewsSection.jsx';
import PatientDashboard from '../components/dashboards/PatientDashboard.jsx';
import AppointmentsSection from '../components/dashboards/sections/AppointmentsSection.jsx';
import ChatRoom from '../components/dashboards/sections/ChatRoom.jsx';
import NotificationPanel from '../components/dashboards/sections/NotificationPanel.jsx';
import ReferralsSection from '../components/dashboards/sections/ReferralsSection.jsx';
// import SocialWorkerDashboard from '../components/dashboards/SocialWorkerDashboard.jsx'
// import HealthRecordSection from '../components/dashboard/sections/HealthRecordSection.jsx';
// import OtherDashboard from '../components/dashboards/OtherDashboard';
// import ChwDashboard from '../components/dashboards/ChwDashboard.jsx';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // Target the backend server
axios.defaults.withCredentials = true; // This will allow axios to send cookies with requests, which is necessary for session management

// --- Staff Dashboard Component ---
const StaffDashboard = ({ user, handleLogout, socket, notifications, chatMessages, contacts }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'patients', label: 'Patients', icon: <FaUsers /> },
    { id: 'prescriptions', label: 'E-Prescriptions', icon: <FaPrescriptionBottle /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'telehealth', label: 'Telehealth', icon: <FaHeartbeat /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
    { id: 'chat', label: 'Chat Room', icon: <FaComments /> },
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
            <span>{user.profession ? `${user.profession} Portal` : 'Clinician Portal'}</span>
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
            <header className='mb-12 pb-6 border-b border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>
                  Welcome, {user.profession?.toLowerCase() === 'doctor' ? 'Dr. ' : user.profession?.toLowerCase() === 'nurse' ? 'Nurse ' : ''}{user.fullname}
                </h1>
                <p className='text-gray-400 text-sm mt-1'>Org: {user.organization}</p>
              </div>
              <div className='flex items-center gap-4 self-end md:self-auto'>
                {user.fulfillment_code && (
                  <div className='bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/20'>
                    <div className='flex flex-col text-left'>
                      <span className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider'>Fulfillment Code</span>
                      <span className='font-mono text-base font-black tracking-widest text-emerald-400'>{user.fulfillment_code}</span>
                    </div>
                  </div>
                )}
                <NotificationPanel notifications={notifications} socket={socket} />
              </div>
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
        ) : activeTab === 'chat' ? (
          <ChatRoom user={user} socket={socket} chatMessages={chatMessages} contacts={contacts} />
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

// --- Social Worker Dashboard Component ---
const SocialWorkerDashboard = ({ user, handleLogout, socket, notifications, chatMessages, contacts }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'patients', label: 'Patients', icon: <FaUsers /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
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

          {/* Social Worker Portal Tag */}
          <div className='bg-violet-500/10 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase mb-6 flex items-center gap-2'>
            <FaUsers />
            <span>Social Worker Portal</span>
          </div>

          {/* Navigation Links */}
          <nav className='space-y-1.5'>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
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

      {/* Main Content */}
      <main className='flex-1 p-6 md:p-12 overflow-y-auto relative z-10'>
        {activeTab === 'overview' ? (
          <div className='max-w-6xl mx-auto'>
            {/* Header */}
            <header className='mb-12 pb-6 border-b border-violet-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, Social Worker {user.fullname}</h1>
                <p className='text-gray-400 text-sm mt-1'>Org: {user.organization}</p>
              </div>
              <div className='flex items-center gap-4 self-end md:self-auto'>
                {user.fulfillment_code && (
                  <div className='bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/20'>
                    <div className='flex flex-col text-left'>
                      <span className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider'>Fulfillment Code</span>
                      <span className='font-mono text-base font-black tracking-widest text-violet-400'>{user.fulfillment_code}</span>
                    </div>
                  </div>
                )}
                <NotificationPanel notifications={notifications} socket={socket} />
              </div>
            </header>

            {/* Quick Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
              {[
                { label: 'Assigned Cases', value: '38', icon: <FaUsers className='text-violet-400' />, desc: '12 high priority' },
                { label: "Today's Visits", value: '4', icon: <FaCalendarAlt className='text-indigo-400' />, desc: '2 completed' },
                { label: 'Referrals Logged', value: '15', icon: <FaExchangeAlt className='text-purple-400' />, desc: '+3 this month' },
                { label: 'Tasks Pending', value: '6', icon: <FaClipboardList className='text-pink-400' />, desc: 'Due today' }
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

            {/* Dashboard Sections */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Area: Cases List */}
              <div className='lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-xl font-bold flex items-center gap-2'>
                    <FaClipboardList className='text-violet-400' />
                    Recent Case Actions
                  </h2>
                </div>
                
                <div className='space-y-4'>
                  {[
                    { name: 'Thabo Mbeki', condition: 'Housing Assistance Coordination', time: '09:00 AM', status: 'Completed' },
                    { name: 'Naledi Pandor', condition: 'Family Support Consultation', time: '11:00 AM', status: 'Completed' },
                    { name: 'Cyril Ramaphosa', condition: 'Community Grant Guidance', time: '01:30 PM', status: 'In Progress' },
                    { name: 'Helen Zille', condition: 'Elderly Care Assessment', time: '03:00 PM', status: 'Upcoming' }
                  ].map((patient, idx) => (
                    <div key={idx} className='flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300'>
                      <div>
                        <h3 className='font-semibold'>{patient.name}</h3>
                        <p className='text-xs text-gray-400'>{patient.condition}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium mb-1'>{patient.time}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          patient.status === 'Completed' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                          patient.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                          'bg-white/5 text-gray-400 border border-white/10'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Area: Social Tools */}
              <div className='space-y-6'>
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                  <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                    <FaMedkit className='text-indigo-400' />
                    Social Services Tools
                  </h2>
                  <div className='space-y-3'>
                    {['Log Case Assessment', 'Coordinate Care Plan', 'Access Resource Registry', 'Outreach Scheduling'].map((tool, idx) => (
                      <button key={idx} className='cursor-pointer w-full text-left bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/20 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]'>
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
        ) : activeTab === 'chat' ? (
          <ChatRoom user={user} socket={socket} chatMessages={chatMessages} contacts={contacts} />
        ) : (
          <div className='max-w-4xl mx-auto text-center py-20 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl'>
            <FaUsers size={60} className='mx-auto mb-4 text-violet-400 animate-pulse' />
            <h2 className='text-2xl font-bold mb-2 capitalize'>{activeTab} Section</h2>
            <p className='text-gray-400 text-sm max-w-md mx-auto'>
              The features for the social worker dashboard's {activeTab} tab will be fully implemented according to subsequent instructions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Other / Support Dashboard Component ---
const OtherDashboard = ({ user, handleLogout, socket, notifications, chatMessages, contacts }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'patients', label: 'Patients', icon: <FaUsers /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
    { id: 'chat', label: 'Chat Room', icon: <FaComments /> },
  ];

  return (
    <div className='min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      {/* Sidebar */}
      <aside className='w-full md:w-64 bg-[#090b0d] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 shrink-0 relative z-20 justify-between'>
        <div>
          {/* Logo / Brand */}
          <div className='flex items-center gap-2 mb-8'>
            <div className='bg-amber-500 text-black p-1.5 rounded-lg font-bold flex items-center justify-center'>
              <FaHeartbeat size={18} />
            </div>
            <span className='text-lg font-black tracking-tight text-white'>
              Ubuntu<span className='text-amber-500'>Health</span>
            </span>
          </div>

          {/* Support Portal Tag */}
          <div className='bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase mb-6 flex items-center gap-2'>
            <FaHospital />
            <span>Support Portal</span>
          </div>

          {/* Navigation Links */}
          <nav className='space-y-1.5'>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' 
                    : 'bg-white/5 hover:bg-amber-500/10 text-gray-400 hover:text-amber-400 border border-transparent hover:border-amber-500/20'
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
            <header className='mb-12 pb-6 border-b border-amber-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, Support Staff {user.fullname}</h1>
                <p className='text-gray-400 text-sm mt-1'>Org: {user.organization}</p>
              </div>
              <div className='flex items-center gap-4 self-end md:self-auto'>
                {user.fulfillment_code && (
                  <div className='bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/20'>
                    <div className='flex flex-col text-left'>
                      <span className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider'>Fulfillment Code</span>
                      <span className='font-mono text-base font-black tracking-widest text-amber-400'>{user.fulfillment_code}</span>
                    </div>
                  </div>
                )}
                <NotificationPanel notifications={notifications} socket={socket} />
              </div>
            </header>

            {/* Quick Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
              {[
                { label: 'Assigned Tasks', value: '18', icon: <FaClipboardList className='text-amber-400' />, desc: '4 active' },
                { label: 'Support Queue', value: '5', icon: <FaHospital className='text-orange-400' />, desc: '3 unresolved' },
                { label: 'System Logs', value: '124', icon: <FaTasks className='text-yellow-400' />, desc: 'All systems normal' },
                { label: 'Daily Events', value: '2', icon: <FaCalendarAlt className='text-red-400' />, desc: 'Next at 3:00 PM' }
              ].map((stat, idx) => (
                <div key={idx} className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 hover:scale-[1.02] transition-all duration-300'>
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
              {/* Main Area: Tasks List */}
              <div className='lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-xl font-bold flex items-center gap-2'>
                    <FaClipboardList className='text-amber-400' />
                    Daily Support Activities
                  </h2>
                </div>
                
                <div className='space-y-4'>
                  {[
                    { name: 'System Maintenance', condition: 'Database Backup & Health Check', time: '08:00 AM', status: 'Completed' },
                    { name: 'Inventory Audit', condition: 'Verify Clinic Supply Stock', time: '10:00 AM', status: 'Completed' },
                    { name: 'Registration Desk Help', condition: 'Support New Patients In-take', time: '02:00 PM', status: 'In Progress' },
                    { name: 'Facility Audit', condition: 'Environmental Safety Checklist', time: '04:30 PM', status: 'Upcoming' }
                  ].map((patient, idx) => (
                    <div key={idx} className='flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300'>
                      <div>
                        <h3 className='font-semibold'>{patient.name}</h3>
                        <p className='text-xs text-gray-400'>{patient.condition}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium mb-1'>{patient.time}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          patient.status === 'Completed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          patient.status === 'In Progress' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-white/5 text-gray-400 border border-white/10'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Area: Support Tools */}
              <div className='space-y-6'>
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
                  <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                    <FaMedkit className='text-orange-400' />
                    Support Utilities
                  </h2>
                  <div className='space-y-3'>
                    {['System Health Logs', 'Directory Registry', 'Access Support Queue', 'Log General Task'].map((tool, idx) => (
                      <button key={idx} className='cursor-pointer w-full text-left bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/20 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]'>
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
        ) : activeTab === 'chat' ? (
          <ChatRoom user={user} socket={socket} chatMessages={chatMessages} contacts={contacts} />
        ) : (
          <div className='max-w-4xl mx-auto text-center py-20 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl'>
            <FaHospital size={60} className='mx-auto mb-4 text-amber-400 animate-pulse' />
            <h2 className='text-2xl font-bold mb-2 capitalize'>{activeTab} Section</h2>
            <p className='text-gray-400 text-sm max-w-md mx-auto'>
              The features for the support dashboard's {activeTab} tab will be fully implemented according to subsequent instructions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Patient Dashboard Component ---

// --- CHW Dashboard Component ---
const ChwDashboard = ({ user, handleLogout, socket, notifications, chatMessages, contacts }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const res = await axios.get('/api/patients');
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error("Failed to fetch CHW patients:", err);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'households', label: 'My Patients', icon: <FaUsers /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'outreach', label: 'Outreach Events', icon: <FaClock /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
    { id: 'chat', label: 'Chat Room', icon: <FaComments /> },
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
            <header className='mb-12 pb-6 border-b border-orange-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, {user.fullname}</h1>
                <p className='text-gray-400 text-sm mt-1'>Org: {user.organization}</p>
              </div>
              <div className='flex items-center gap-4 self-end md:self-auto'>
                {user.fulfillment_code && (
                  <div className='bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/20'>
                    <div className='flex flex-col text-left'>
                      <span className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider'>Fulfillment Code</span>
                      <span className='font-mono text-base font-black tracking-widest text-orange-400'>{user.fulfillment_code}</span>
                    </div>
                  </div>
                )}
                <NotificationPanel notifications={notifications} socket={socket} />
              </div>
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
        ) : activeTab === 'households' ? (
          selectedPatientId ? (
            <HealthRecordSection patientId={selectedPatientId} role='chw' onClose={() => setSelectedPatientId(null)} />
          ) : (
            <div className='max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl text-left animate-in fade-in duration-200'>
              <h2 className='text-xl font-bold flex items-center gap-2 mb-6'>
                <FaUsers className='text-orange-400' />
                My Assigned Patients
              </h2>
              {loadingPatients ? (
                <div className='text-center py-12 text-gray-500 text-sm'>Loading assigned patients...</div>
              ) : patients.length === 0 ? (
                <div className='text-center py-12 text-gray-500 text-sm'>No patients assigned to you.</div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {patients.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedPatientId(p.id)}
                      className='cursor-pointer bg-white/5 border border-white/5 hover:border-orange-500/25 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300'
                    >
                      <h3 className='font-bold text-base text-orange-300'>{p.fullname}</h3>
                      <p className='text-xs text-gray-400 mt-1'>ID: {p.identity} | {p.gender}</p>
                      <p className='text-xs text-gray-300 mt-2 font-medium'><span className='text-gray-500'>Diagnosis:</span> {p.diagnosis}</p>
                      <div className='flex justify-between items-center mt-4 border-t border-white/5 pt-3 text-[11px] text-gray-400'>
                        <span>{p.phone_number}</span>
                        <span className='text-orange-400 hover:underline font-bold'>View Clinical Files &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ) : activeTab === 'appointments' ? (
          <AppointmentsSection user={user} />
        ) : activeTab === 'referrals' ? (
          <ReferralsSection user={user} />
        ) : activeTab === 'reviews' ? (
          <ReviewsSection user={user} />
        ) : activeTab === 'chat' ? (
          <ChatRoom user={user} socket={socket} chatMessages={chatMessages} contacts={contacts} />
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

// --- Reusable Reviews Section Component ---

// --- Reusable Health Record Section Component ---
const HealthRecordSection = ({ patientId, role, onClose }) => {
  const [data, setData] = useState({
    records: [],
    routines: [],
    appointments: [],
    referrals: [],
    organizationWatermark: 'Mzansi Health',
    patientInfo: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [period, setPeriod] = useState('all');
  const [includeAppointments, setIncludeAppointments] = useState(false);
  const [includeReferrals, setIncludeReferrals] = useState(false);

  // Editing / adding state
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newRecordData, setNewRecordData] = useState({
    blood_group: '', weight: '', height: '', temperature: '', blood_pressure: '', heart_rate: '',
    symptoms: '', allergies: '', diagnosis: '', procedures: '', admission_date: '', release_date: '',
    prescription: '', long_term_treatment: false, care_giver: ''
  });

  // Verification state (required for editing)
  const [verification, setVerification] = useState({ patient_name: '', fulfillment_key: '' });

  // Routine state
  const [showAddRoutine, setShowAddRoutine] = useState(null); // record_id
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineData, setRoutineData] = useState({
    routine_range: 'weekly',
    routine_day: 'Monday',
    description: '',
    attended: false
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/records/${patientId}`);
      setData(res.data);
      if (res.data.patientInfo) {
        setVerification({
          patient_name: res.data.patientInfo.fullname,
          fulfillment_key: ''
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  const getThemeColors = () => {
    switch (role?.toLowerCase()) {
      case 'patient':
        return {
          accent: 'text-purple-400',
          bgAccent: 'bg-purple-500',
          hoverBg: 'hover:bg-purple-600',
          borderAccent: 'border-purple-500/20',
          shadow: 'shadow-purple-500/25',
          btnBg: 'bg-purple-500 text-black',
        };
      case 'staff':
        return {
          accent: 'text-emerald-400',
          bgAccent: 'bg-emerald-500',
          hoverBg: 'hover:bg-emerald-600',
          borderAccent: 'border-emerald-500/20',
          shadow: 'shadow-emerald-500/25',
          btnBg: 'bg-emerald-500 text-black',
        };
      case 'chw':
        return {
          accent: 'text-orange-400',
          bgAccent: 'bg-orange-500',
          hoverBg: 'hover:bg-orange-600',
          borderAccent: 'border-orange-500/20',
          shadow: 'shadow-orange-500/25',
          btnBg: 'bg-orange-500 text-black',
        };
      default: // admin
        return {
          accent: 'text-violet-400',
          bgAccent: 'bg-violet-500',
          hoverBg: 'hover:bg-violet-600',
          borderAccent: 'border-violet-500/20',
          shadow: 'shadow-violet-500/25',
          btnBg: 'bg-violet-500 text-black',
        };
    }
  };
  const theme = getThemeColors();

  const filterByPeriod = (items, dateField, selectedPeriod) => {
    if (selectedPeriod === 'all') return items;
    const days = selectedPeriod === '1month' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return items.filter(item => {
      const d = new Date(item[dateField]);
      return d >= cutoff;
    });
  };

  const addWatermark = (doc, text) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(240, 240, 240);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(65);
      doc.text(text.toUpperCase(), 15, 270, { angle: 53 });
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const watermarkText = data.organizationWatermark || 'Mzansi Health';
    
    const filteredRecords = filterByPeriod(data.records, 'admission_date', period);
    const filteredRoutines = filterByPeriod(data.routines, 'date', period);
    const filteredAppointments = includeAppointments ? filterByPeriod(data.appointments, 'date_time', period) : [];
    const filteredReferrals = includeReferrals ? filterByPeriod(data.referrals, 'created_at', period) : [];

    let y = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55);
    doc.text("UBUNTU HEALTH - CLINICAL REPORT", 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Filter: ${period === 'all' ? 'All Time' : period === '1month' ? 'Last 30 Days' : 'Last 90 Days'}`, 14, y);
    y += 15;

    // Patient info box
    doc.setFillColor(243, 244, 246);
    doc.rect(14, y, 182, 35, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("PATIENT RECORD SUMMARY", 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Full Name: ${data.patientInfo?.fullname || 'N/A'}`, 18, y + 14);
    doc.text(`Identity Number: ${data.patientInfo?.identity || 'N/A'}`, 18, y + 20);
    doc.text(`Gender: ${data.patientInfo?.gender || 'N/A'}`, 18, y + 26);
    doc.text(`Primary Diagnosis: ${data.patientInfo?.diagnosis || 'N/A'}`, 100, y + 14);
    doc.text(`Contact: ${data.patientInfo?.phone_number || 'N/A'}`, 100, y + 20);
    doc.text(`Registered At: ${data.organizationWatermark}`, 100, y + 26);
    y += 45;

    // Health Records Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("1. Health Logs", 14, y);
    y += 8;

    if (filteredRecords.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text("No health logs found for the selected period.", 14, y);
      y += 10;
    } else {
      filteredRecords.forEach((record, index) => {
        if (y > 230) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(79, 70, 229);
        doc.text(`Log #${filteredRecords.length - index} - Admitted: ${new Date(record.admission_date).toLocaleDateString()}`, 14, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        doc.text(`Blood Group: ${record.blood_group || 'N/A'} | Weight: ${record.weight ? record.weight+' kg' : 'N/A'} | Height: ${record.height ? record.height+' cm' : 'N/A'} | Temp: ${record.temperature ? record.temperature+' °C' : 'N/A'}`, 14, y);
        y += 5;
        doc.text(`Blood Pressure: ${record.blood_pressure || 'N/A'} mmHg | Heart Rate: ${record.heart_rate ? record.heart_rate+' bpm' : 'N/A'}`, 14, y);
        y += 5;
        doc.text(`Symptoms: ${record.symptoms || 'None'}`, 14, y);
        y += 5;
        doc.text(`Diagnosis: ${record.diagnosis || 'None'}`, 14, y);
        y += 5;
        doc.text(`Prescription: ${record.prescription || 'None'}`, 14, y);
        y += 5;
        doc.text(`Caregiver: ${record.care_giver || 'Unassigned'}`, 14, y);
        y += 10;
      });
    }

    // Routines Section
    if (y > 230) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("2. Routine Monitoring Schedules", 14, y);
    y += 8;

    if (filteredRoutines.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text("No routine tasks scheduled.", 14, y);
      y += 10;
    } else {
      filteredRoutines.forEach((routine) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55);
        doc.text(`Routine Date: ${new Date(routine.date).toLocaleDateString()}`, 14, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Range: ${routine.routine_range} | Day Config: ${routine.routine_day} | Status: ${routine.attended ? 'Attended' : 'Pending'}`, 80, y);
        y += 5;
        doc.text(`Description: ${routine.description}`, 14, y);
        y += 8;
      });
    }

    // Optional Appointments
    if (includeAppointments) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text("3. Appointments Logs", 14, y);
      y += 8;

      if (filteredAppointments.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text("No appointments found for this period.", 14, y);
        y += 10;
      } else {
        filteredAppointments.forEach(app => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`${new Date(app.date_time).toLocaleString()} - ${app.status.toUpperCase()}`, 14, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`Reason: ${app.reason} | Key: ${app.appointment_key || 'N/A'}`, 14, y + 5);
          y += 10;
        });
      }
    }

    // Optional Referrals
    if (includeReferrals) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text("4. Referral Logs", 14, y);
      y += 8;

      if (filteredReferrals.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text("No referrals found for this period.", 14, y);
        y += 10;
      } else {
        filteredReferrals.forEach(ref => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`${new Date(ref.created_at).toLocaleDateString()} - ${ref.status.toUpperCase()}`, 14, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`To: ${ref.organization_to} | Key: ${ref.referral_key || 'N/A'}`, 14, y + 5);
          y += 10;
        });
      }
    }

    addWatermark(doc, watermarkText);
    doc.save(`clinical_report_${data.patientInfo?.fullname.replace(/\s+/g, '_') || 'patient'}.pdf`);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!verification.patient_name || !verification.fulfillment_key) {
      alert("Verification required: Please provide patient name and fulfillment key.");
      return;
    }

    try {
      const payload = {
        ...newRecordData,
        patient_name: verification.patient_name,
        fulfillment_key: verification.fulfillment_key
      };

      if (editingRecord) {
        await axios.put(`/api/records/${editingRecord.id}`, payload);
        alert("Health record updated successfully!");
        setEditingRecord(null);
      } else {
        await axios.post(`/api/records/${patientId}`, payload);
        alert("Health record created successfully!");
        setShowAddRecord(false);
      }
      fetchData();
      setNewRecordData({
        blood_group: '', weight: '', height: '', temperature: '', blood_pressure: '', heart_rate: '',
        symptoms: '', allergies: '', diagnosis: '', procedures: '', admission_date: '', release_date: '',
        prescription: '', long_term_treatment: false, care_giver: ''
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save health record.");
    }
  };

  const handleSaveRoutine = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...routineData };

      // If marking as attended, ask for identity
      if (routineData.attended && (!editingRoutine || !editingRoutine.attended)) {
        const patientIdentityInput = prompt("Please enter the patient's identity number manually to mark this routine as attended:");
        if (patientIdentityInput === null) return;
        if (!patientIdentityInput.trim()) {
          alert("Verification required: Patient identity number cannot be empty.");
          return;
        }
        payload.patient_identity = patientIdentityInput.trim();
      }

      if (editingRoutine) {
        await axios.put(`/api/records/routines/${editingRoutine.id}`, payload);
        alert("Routine updated successfully!");
        setEditingRoutine(null);
      } else {
        await axios.post('/api/records/routines', {
          ...payload,
          record_id: showAddRoutine
        });
        alert("Routine created successfully!");
        setShowAddRoutine(null);
      }
      fetchData();
      setRoutineData({
        routine_range: 'weekly',
        routine_day: 'Monday',
        description: '',
        attended: false
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save routine.");
    }
  };

  const handleToggleRoutineAttendance = async (routine) => {
    if (routine.attended) return;

    const patientIdentityInput = prompt("Please enter the patient's identity number manually to mark this routine as attended:");
    if (patientIdentityInput === null) return;
    if (!patientIdentityInput.trim()) {
      alert("Verification required: Patient identity number cannot be empty.");
      return;
    }

    try {
      await axios.put(`/api/records/routines/${routine.id}`, {
        routine_range: routine.routine_range,
        routine_day: routine.routine_day,
        description: routine.description,
        attended: true,
        patient_identity: patientIdentityInput.trim()
      });
      alert("Routine marked as attended successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update routine status.");
    }
  };

  const startEditRecord = (record) => {
    setEditingRecord(record);
    setVerification({
      patient_name: data.patientInfo?.fullname || '',
      fulfillment_key: ''
    });
    setNewRecordData({
      blood_group: record.blood_group || '',
      weight: record.weight || '',
      height: record.height || '',
      temperature: record.temperature || '',
      blood_pressure: record.blood_pressure || '',
      heart_rate: record.heart_rate || '',
      symptoms: record.symptoms || '',
      allergies: record.allergies || '',
      diagnosis: record.diagnosis || '',
      procedures: record.procedures || '',
      admission_date: record.admission_date ? new Date(record.admission_date).toISOString().substring(0, 16) : '',
      release_date: record.release_date ? new Date(record.release_date).toISOString().substring(0, 16) : '',
      prescription: record.prescription || '',
      long_term_treatment: record.long_term_treatment || false,
      care_giver: record.care_giver || ''
    });
  };

  const startEditRoutine = (routine) => {
    if (routine.attended) {
      alert("After a routine is marked as attended, it can no longer be edited.");
      return;
    }
    setEditingRoutine(routine);
    setRoutineData({
      routine_range: routine.routine_range || 'weekly',
      routine_day: routine.routine_day || 'Monday',
      description: routine.description || '',
      attended: routine.attended || false
    });
  };

  const filteredRecords = filterByPeriod(data.records, 'admission_date', period);
  const filteredRoutines = filterByPeriod(data.routines, 'date', period);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const monthDays = Array.from({ length: 28 }, (_, i) => (i + 1).toString());

  if (loading) return <div className="text-center py-12 text-gray-400">Loading Clinical Records...</div>;
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>;

  const isPatient = role?.toLowerCase() === 'patient';

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-8 text-left max-w-6xl mx-auto relative animate-in fade-in zoom-in duration-200">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer">
          ✕ Close
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isPatient ? 'bg-purple-500/20 text-purple-400' : 'bg-violet-500/20 text-violet-400'}`}>
            Clinical Records Profile
          </span>
          <h2 className="text-2xl font-black text-white mt-2">
            {data.patientInfo?.fullname || 'Patient File'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Registered Facility: <span className={theme.accent}>{data.organizationWatermark}</span>
          </p>
        </div>

        {isPatient && (
          <button onClick={generatePDF} className={`cursor-pointer flex items-center gap-2 ${theme.btnBg} ${theme.hoverBg} px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105 shadow-lg ${theme.shadow}`}>
            Download Clinical PDF
          </button>
        )}
      </div>

      {/* Filter and Configuration Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 border border-white/5 rounded-2xl p-5">
        <div>
          <label className="block text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-wider">Report Range</label>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500">
            <option value="all">All Time Records</option>
            <option value="1month">Last 30 Days</option>
            <option value="3months">Last 90 Days</option>
          </select>
        </div>

        {isPatient && (
          <div className="md:col-span-2 flex flex-row items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
              <input type="checkbox" checked={includeAppointments} onChange={e => setIncludeAppointments(e.target.checked)} className="rounded bg-black border-white/10 text-purple-500 focus:ring-purple-500 w-4 h-4" />
              Include Appointment Logs
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
              <input type="checkbox" checked={includeReferrals} onChange={e => setIncludeReferrals(e.target.checked)} className="rounded bg-black border-white/10 text-purple-500 focus:ring-purple-500 w-4 h-4" />
              Include Referral Logs
            </label>
          </div>
        )}
      </div>

      {/* Write / Edit Record Panel */}
      {!isPatient && (showAddRecord || editingRecord) && (
        <form onSubmit={handleSaveRecord} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="font-extrabold text-sm text-white border-b border-white/5 pb-2">
            {editingRecord ? "Edit Clinical Record Entry" : "Create New Clinical Record Entry"}
          </h3>

          {/* Verification section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Database Lock Verification</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Please confirm the patient's name and fulfillment key to unlock and save modifications.</p>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-semibold">Patient Full Name <span className="text-red-400">*</span></label>
              <input type="text" value={verification.patient_name} onChange={e => setVerification({...verification, patient_name: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-semibold">Patient Fulfillment Key <span className="text-red-400">*</span></label>
              <input type="text" value={verification.fulfillment_key} onChange={e => setVerification({...verification, fulfillment_key: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" required />
            </div>
          </div>

          {/* Form Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Blood Group</label>
              <input type="text" placeholder="e.g. O+" value={newRecordData.blood_group} onChange={e => setNewRecordData({...newRecordData, blood_group: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" value={newRecordData.weight} onChange={e => setNewRecordData({...newRecordData, weight: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Height (cm)</label>
              <input type="number" step="0.1" value={newRecordData.height} onChange={e => setNewRecordData({...newRecordData, height: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Temp (°C)</label>
              <input type="number" step="0.1" value={newRecordData.temperature} onChange={e => setNewRecordData({...newRecordData, temperature: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">BP (mmHg)</label>
              <input type="text" placeholder="e.g. 120/80" value={newRecordData.blood_pressure} onChange={e => setNewRecordData({...newRecordData, blood_pressure: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Heart Rate (bpm)</label>
              <input type="number" value={newRecordData.heart_rate} onChange={e => setNewRecordData({...newRecordData, heart_rate: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Admission Date</label>
              <input type="datetime-local" value={newRecordData.admission_date} onChange={e => setNewRecordData({...newRecordData, admission_date: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" required />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Release Date</label>
              <input type="datetime-local" value={newRecordData.release_date} onChange={e => setNewRecordData({...newRecordData, release_date: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" />
            </div>
          </div>

          {/* Texts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Symptoms</label>
              <textarea value={newRecordData.symptoms} onChange={e => setNewRecordData({...newRecordData, symptoms: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs h-16 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Allergies</label>
              <textarea value={newRecordData.allergies} onChange={e => setNewRecordData({...newRecordData, allergies: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs h-16 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Diagnosis</label>
              <textarea value={newRecordData.diagnosis} onChange={e => setNewRecordData({...newRecordData, diagnosis: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs h-16 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Procedures Done</label>
              <textarea value={newRecordData.procedures} onChange={e => setNewRecordData({...newRecordData, procedures: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs h-16 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Prescription Details</label>
              <textarea value={newRecordData.prescription} onChange={e => setNewRecordData({...newRecordData, prescription: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs h-16 resize-none" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Attending Caregiver</label>
                <input type="text" value={newRecordData.care_giver} onChange={e => setNewRecordData({...newRecordData, care_giver: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input type="checkbox" checked={newRecordData.long_term_treatment} onChange={e => setNewRecordData({...newRecordData, long_term_treatment: e.target.checked})} className="rounded bg-black border-white/10 text-violet-500 focus:ring-violet-500 w-4 h-4" />
                Under Long Term Treatment
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowAddRecord(false); setEditingRecord(null); }} className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
            <button type="submit" className={`${theme.btnBg} ${theme.hoverBg} px-4 py-2 rounded-xl text-xs font-bold`}>Save Record</button>
          </div>
        </form>
      )}

      {/* Clinical Logs Tab */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaClipboardList className={theme.accent} />
            Clinical Records Log
          </h3>
          {!isPatient && !showAddRecord && !editingRecord && (
            <button onClick={() => { setShowAddRecord(true); setEditingRecord(null); setVerification(prev => ({ ...prev, fulfillment_key: '' })); }} className={`cursor-pointer flex items-center gap-1.5 text-xs ${theme.btnBg} ${theme.hoverBg} px-4 py-2 rounded-xl font-bold transition-all duration-300 hover:scale-105`}>
              <FaPlus size={10} /> Add record
            </button>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-2xl text-sm">
            No clinical records logged for the selected report range.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRecords.map((record) => {
              const recordRoutines = data.routines.filter(r => r.record_id === record.id);
              return (
                <div key={record.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-6 hover:border-white/10 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-200">
                        Log Entry — Admitted: {new Date(record.admission_date).toLocaleDateString()}
                      </h4>
                      {record.release_date && (
                        <p className="text-[10px] text-gray-400 mt-0.5">Released: {new Date(record.release_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    {!isPatient && (
                      <button onClick={() => startEditRecord(record)} className="text-xs text-violet-400 hover:text-violet-300 font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                        Edit Entry
                      </button>
                    )}
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/20 rounded-xl p-4">
                    {[
                      { label: 'Blood Group', val: record.blood_group },
                      { label: 'Weight', val: record.weight ? record.weight+' kg' : null },
                      { label: 'Height', val: record.height ? record.height+' cm' : null },
                      { label: 'Temperature', val: record.temperature ? record.temperature+' °C' : null },
                      { label: 'Blood Pressure', val: record.blood_pressure ? record.blood_pressure+' mmHg' : null },
                      { label: 'Heart Rate', val: record.heart_rate ? record.heart_rate+' bpm' : null },
                      { label: 'Long Term Treatment', val: record.long_term_treatment ? 'Yes' : 'No' },
                      { label: 'Caregiver', val: record.care_giver }
                    ].map((vit, idx) => (
                      <div key={idx} className="text-left">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-semibold">{vit.label}</span>
                        <span className="font-bold text-xs text-white mt-1 block">{vit.val || 'N/A'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Diagnosis & Prescriptions details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {record.symptoms && (
                      <div className="bg-white/5 p-3.5 rounded-xl">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Symptoms Logged</span>
                        <p className="text-gray-200">{record.symptoms}</p>
                      </div>
                    )}
                    {record.allergies && (
                      <div className="bg-white/5 p-3.5 rounded-xl border border-red-500/15">
                        <span className="block text-[9px] text-red-400 uppercase tracking-wider font-semibold mb-1">Allergies/Contraindications</span>
                        <p className="text-gray-200">{record.allergies}</p>
                      </div>
                    )}
                    {record.diagnosis && (
                      <div className="bg-white/5 p-3.5 rounded-xl">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Diagnosis</span>
                        <p className="text-gray-200">{record.diagnosis}</p>
                      </div>
                    )}
                    {record.procedures && (
                      <div className="bg-white/5 p-3.5 rounded-xl">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Procedures Conducted</span>
                        <p className="text-gray-200">{record.procedures}</p>
                      </div>
                    )}
                    {record.prescription && (
                      <div className="md:col-span-2 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                        <span className="block text-[9px] text-emerald-400 uppercase tracking-wider font-semibold mb-1">Prescription details</span>
                        <p className="text-gray-200 font-medium">{record.prescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Record's Routines */}
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-300">Routines for this Log</span>
                      {!isPatient && (
                        <button type="button" onClick={() => { setShowAddRoutine(record.id); setEditingRoutine(null); }} className="text-[10px] text-violet-400 font-bold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 hover:bg-white/10">
                          + Add Routine
                        </button>
                      )}
                    </div>

                    {/* Add/Edit Routine inline form */}
                    {!isPatient && (showAddRoutine === record.id || (editingRoutine && recordRoutines.some(r => r.id === editingRoutine.id))) && (
                      <form onSubmit={handleSaveRoutine} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-4">
                        <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">
                          {editingRoutine ? "Edit Routine Task" : "Create Routine Task"}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">Range Type</label>
                            <select value={routineData.routine_range} onChange={e => setRoutineData({...routineData, routine_range: e.target.value})} className="w-full px-2 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs">
                              <option value="weekly">Weekly Range</option>
                              <option value="monthly">Monthly Range</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-gray-400 mb-1">Scheduled Day</label>
                            <select value={routineData.routine_day} onChange={e => setRoutineData({...routineData, routine_day: e.target.value})} className="w-full px-2 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs">
                              {routineData.routine_range === 'weekly' ? (
                                weekDays.map(wd => <option key={wd} value={wd}>{wd}</option>)
                              ) : (
                                monthDays.map(md => <option key={md} value={md}>Day {md}</option>)
                              )}
                            </select>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 mb-2">
                              <input type="checkbox" checked={routineData.attended} onChange={e => setRoutineData({...routineData, attended: e.target.checked})} className="rounded bg-black border-white/10 text-violet-500 focus:ring-violet-500 w-4 h-4" />
                              Attended Status
                            </label>
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[9px] text-gray-400 mb-1">Routine Description</label>
                            <input type="text" placeholder="e.g. Daily glucose check, or Weekly blood test follow up" value={routineData.description} onChange={e => setRoutineData({...routineData, description: e.target.value})} className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs" required />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button type="button" onClick={() => { setShowAddRoutine(null); setEditingRoutine(null); }} className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">Cancel</button>
                          <button type="submit" className="bg-violet-500 text-black font-bold px-3 py-1.5 rounded-lg">Save Routine</button>
                        </div>
                      </form>
                    )}

                    {/* Routines List */}
                    {recordRoutines.length === 0 ? (
                      <p className="text-[11px] text-gray-500 italic">No scheduled routines registered under this log.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {recordRoutines.map(routine => (
                          <div key={routine.id} className="bg-black/15 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${routine.routine_range === 'weekly' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>
                                  {routine.routine_range}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">Day: {routine.routine_day} | Calculated Occurence: {new Date(routine.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-gray-200 mt-1">{routine.description}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button 
                                disabled={routine.attended}
                                onClick={() => handleToggleRoutineAttendance(routine)} 
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${
                                  routine.attended 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-not-allowed opacity-80' 
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-violet-500/20 hover:text-violet-400 cursor-pointer'
                                }`}
                              >
                                {routine.attended ? 'Attended' : 'Mark Attended'}
                              </button>
                              {!isPatient && !routine.attended && (
                                <button onClick={() => startEditRoutine(routine)} className="text-[10px] font-semibold text-gray-400 hover:text-white bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Reusable Referrals Section Component ---

// --- Admin Dashboard Component ---
const AdminDashboard = ({ user, handleLogout, socket, notifications, chatMessages, contacts }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizationsCount, setOrganizationsCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // --- Patients Database ---
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    setSelectedPatientId(null);
  }, [activeTab]);


  const [chws, setChws] = useState([
    { id: 1, fullname: "Sizwe Dube", identity: "9102145321087", phone_number: "0734445555", email: "sizwe.dube@ubuntuhealth.org", area: "Khayelitsha Site C", tasks: [
      { id: 1, title: "Deliver immunizations", desc: "Immunization follow-up for newborn in Household 4", priority: "High", deadline: "2026-06-14", status: "Assigned" },
      { id: 2, title: "TB screening", desc: "Screen contacts of active TB patient in Block A", priority: "High", deadline: "2026-06-10", status: "Completed" }
    ]},
    { id: 2, fullname: "Nokuthula Zulu", identity: "9310050876092", phone_number: "0847778888", email: "n.zulu@ubuntuhealth.org", area: "Nyanga Block 3", tasks: [
      { id: 3, title: "Hypertension check", desc: "Confirm blood pressure compliance for Mrs. Cele", priority: "Medium", deadline: "2026-06-15", status: "Assigned" }
    ]}
  ]);

  const [appointments, setAppointments] = useState([
    { id: 1, patientName: "Thabo Cele", staffName: "Dr. Lerato Sibanda", date: "2026-06-16", time: "09:30 AM", status: "Scheduled" },
    { id: 2, patientName: "Johan Botha", staffName: "Dr. Alan Mercer", date: "2026-06-17", time: "11:00 AM", status: "Scheduled" }
  ]);

  const [staff, setStaff] = useState([
    { id: 1, fullname: "Dr. Lerato Sibanda", role: "General Practitioner", email: "l.sibanda@ubuntuhealth.org", phone_number: "0721112222", availability: "Available" },
    { id: 2, fullname: "Dr. Alan Mercer", role: "Cardiologist", email: "a.mercer@ubuntuhealth.org", phone_number: "0813334444", availability: "On Leave" },
    { id: 3, fullname: "Sister Helen Ndlovu", role: "Senior Nurse", email: "h.ndlovu@ubuntuhealth.org", phone_number: "0625556666", availability: "On Duty" }
  ]);

  // Reviews state removed to use database reviews in ReviewsSection



  // --- Form Input States ---
  const [newPatient, setNewPatient] = useState({
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
    nok_email: '',
    chw_id: ''
  });
  const [newChw, setNewChw] = useState({
    employee_id: '',
    fullname: '',
    identity: '',
    password: '',
    email: '',
    phone_number: ''
  });
  const [newTask, setNewTask] = useState({ title: '', desc: '', priority: 'High', deadline: '' });
  const [newAppointment, setNewAppointment] = useState({ patientName: '', staffName: '', date: '', time: '' });
  // newReview state removed to use database reviews in ReviewsSection
  


  const [selectedChwId, setSelectedChwId] = useState(1);

  // --- Fetch Backend Accounts ---
  useEffect(() => {
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
    if (!newPatient.fullname || !newPatient.identity || !newPatient.gender || !newPatient.password || !newPatient.nok_fullname) {
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
        nok_email: '',
        chw_id: ''
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
            <header className='mb-12 pb-6 border-b border-violet-500/20 flex justify-between items-center'>
              <div>
                <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, Admin {user.fullname}</h1>
                <p className='text-gray-400 text-sm mt-1'>Org: {user.organization || 'Cape Town Clinic'}</p>
              </div>
              <NotificationPanel notifications={notifications} socket={socket} />
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
          selectedPatientId ? (
            <HealthRecordSection 
              patientId={selectedPatientId} 
              role={user.role} 
              onClose={() => setSelectedPatientId(null)} 
            />
          ) : (
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
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedPatientId(p.id)}
                        className='cursor-pointer bg-white/5 border border-white/5 hover:border-violet-500/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'
                      >
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
              {/*----------- Registering a new patient--------------- */}
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
                      {/* <div>
                        <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Diagnosis <span className='text-red-400'>*</span></label>
                        <input 
                          type="text" 
                          placeholder="e.g. Chronic Hypertension" 
                          value={newPatient.diagnosis} 
                          onChange={e => setNewPatient({ ...newPatient, diagnosis: e.target.value })} 
                          className='w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-xs' 
                          required
                        />
                      </div> */}
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
                    {/* <div className="mt-3">
                      <label className='block text-[10px] text-gray-400 mb-1 font-semibold'>Assign Community Health Worker (CHW)</label>
                      <select 
                        value={newPatient.chw_id || ''} 
                        onChange={e => setNewPatient({ ...newPatient, chw_id: e.target.value })} 
                        className='w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-xs font-semibold'
                      >
                        <option value="" className='bg-slate-900'>Select CHW (Optional)</option>
                        {chws.map(c => (
                          <option key={c.id} value={c.id} className='bg-slate-900'>{c.fullname} (ID: {c.identity})</option>
                        ))}
                      </select>
                    </div> */}
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
          )
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
          <ChatRoom user={user} socket={socket} chatMessages={chatMessages} contacts={contacts} />
        )}
      </main>
    </div>
  );
};

// --- Reusable Notification Panel ---

// --- Reusable Chat Room Component---

// --- Main Dashboard Dispatcher ---
const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const socketUrl = (import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
    const socketInstance = io(socketUrl, {
      withCredentials: true
    });

    setSocket(socketInstance);

    const role = user.role?.toLowerCase();
    const userId = `${role === 'admin' || role === 'staff' ? 'user' : role}_${user.id}`;

    socketInstance.emit('register', userId);

    socketInstance.on('chat_history', (msgs) => {
      setChatMessages(msgs);
    });

    socketInstance.on('notifications_history', (notifs) => {
      setNotifications(notifs);
    });

    socketInstance.on('receive_message', (msg) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socketInstance.on('receive_notification', (notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
    });

    const fetchContacts = async () => {
      try {
        const res = await axios.get('/api/auth/contacts');
        setContacts(res.data.contacts || []);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    };
    fetchContacts();

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

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

  const commonProps = {
    user,
    handleLogout,
    socket,
    notifications,
    chatMessages,
    contacts
  };

  if (role === 'admin') {
    return <AdminDashboard {...commonProps} />;
  } else if (role === 'staff') {
    const profession = user.profession?.toLowerCase();
    if (profession === 'social worker') {
      return <SocialWorkerDashboard {...commonProps} />;
    } else if (profession === 'other') {
      return <OtherDashboard {...commonProps} />;
    } else {
      return <StaffDashboard {...commonProps} />;
    }
  } else if (role === 'chw') {
    return <ChwDashboard {...commonProps} />;
  } else {
    // Default to Patient Dashboard if role is 'patient' or unspecified
    return <PatientDashboard {...commonProps} />;
  }
};

export default Dashboard;
