import React from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck } from 'react-icons/fa';
import AppointmentsSection from './AppointmentsSection';
import ChatRoom from './ChatRoom';
import HealthRecordSection from './HealthRecordSection';
import NotificationPanel from './NotificationPanel';
import ReferralsSection from './ReferralsSection';
import ReviewsSection from './ReviewsSection';
const PatientDashboard = ({ user, handleLogout, socket, notifications, chatMessages, contacts }) => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaTasks /> },
    { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { id: 'referrals', label: 'Referrals', icon: <FaExchangeAlt /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FaPrescriptionBottle /> },
    { id: 'records', label: 'Health Records', icon: <FaFileMedicalAlt /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
    { id: 'chat', label: 'Chat Room', icon: <FaComments /> },
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
            <header className='mb-12 pb-6 border-b border-purple-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Hello, {user.fullname}</h1>
                <p className='text-gray-400 text-sm mt-1'>Identity: {user.identity?.trim()}</p>
                <p className='text-gray-400 text-sm mt-1'>Organization: {user.organization?.trim()}</p>
              </div>
              <div className='flex items-center gap-4 self-end md:self-auto'>
                {user.fulfillment_code && (
                  <div className='bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/20'>
                    <div className='flex flex-col text-left'>
                      <span className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider'>Fulfillment Code</span>
                      <span className='font-mono text-base font-black tracking-widest text-purple-400'>{user.fulfillment_code}</span>
                    </div>
                  </div>
                )}
                <NotificationPanel notifications={notifications} socket={socket} />
              </div>
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
        ) : activeTab === 'records' ? (
          <HealthRecordSection patientId={user.id} role='patient' />
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


export default PatientDashboard;
