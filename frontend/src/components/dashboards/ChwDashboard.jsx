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
const ChwDashboard = ({ user, handleLogout, socket, notifications, chatMessages, contacts }) => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [patients, setPatients] = React.useState([]);
  const [loadingPatients, setLoadingPatients] = React.useState(true);
  const [selectedPatientId, setSelectedPatientId] = React.useState(null);

  React.useEffect(() => {
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


export default ChwDashboard;
