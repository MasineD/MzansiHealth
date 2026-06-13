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
  FaTasks
} from 'react-icons/fa';

// --- Staff Dashboard Component ---
const StaffDashboard = ({ user, handleLogout }) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-6 md:p-12 relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      <div className='max-w-6xl mx-auto relative z-10'>
        {/* Header */}
        <header className='flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 pb-6 border-b border-emerald-500/20'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='bg-emerald-500/20 text-emerald-400 p-2.5 rounded-lg border border-emerald-500/30'>
                <FaUserMd size={28} />
              </div>
              <span className='bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase'>
                Clinician Portal
              </span>
            </div>
            <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, Dr. {user.fullname}</h1>
          </div>
          <button 
            onClick={handleLogout} 
            className='cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-95'
          >
            <FaSignOutAlt />
            Logout
          </button>
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
              <button className='cursor-pointer flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105'>
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
    </div>
  );
};

// --- Patient Dashboard Component ---
const PatientDashboard = ({ user, handleLogout }) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 md:p-12 relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      <div className='max-w-6xl mx-auto relative z-10'>
        {/* Header */}
        <header className='flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 pb-6 border-b border-purple-500/20'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='bg-purple-500/20 text-purple-400 p-2.5 rounded-lg border border-purple-500/30'>
                <FaUser size={28} />
              </div>
              <span className='bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase'>
                Patient Dashboard
              </span>
            </div>
            <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Hello, {user.fullname}</h1>
          </div>
          <button 
            onClick={handleLogout} 
            className='cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-95'
          >
            <FaSignOutAlt />
            Logout
          </button>
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
    </div>
  );
};

// --- CHW Dashboard Component ---
const ChwDashboard = ({ user, handleLogout }) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 text-white p-6 md:p-12 relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      <div className='max-w-6xl mx-auto relative z-10'>
        {/* Header */}
        <header className='flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 pb-6 border-b border-orange-500/20'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='bg-orange-500/20 text-orange-400 p-2.5 rounded-lg border border-orange-500/30'>
                <FaUsers size={28} />
              </div>
              <span className='bg-orange-500/10 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase'>
                CHW Portal
              </span>
            </div>
            <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, {user.fullname}</h1>
          </div>
          <button 
            onClick={handleLogout} 
            className='cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-95'
          >
            <FaSignOutAlt />
            Logout
          </button>
        </header>

        {/* Community Work Stats Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
          {[
            { label: 'Households Visited', value: '45', icon: <FaUsers className='text-amber-400' />, desc: 'Target: 50 this month' },
            { label: 'Referrals Submitted', value: '18', icon: <FaFileMedicalAlt className='text-orange-400' />, desc: '3 pending reviews' },
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
              <button className='cursor-pointer flex items-center gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105'>
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
    </div>
  );
};
// --- Admin Dashboard Component ---
const AdminDashboard = ({ user, handleLogout }) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [organizationsCount, setOrganizationsCount] = React.useState(0);

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
  const staffCount = users.filter(u => u.role?.toLowerCase() === 'staff').length;
  const adminCount = users.filter(u => u.role?.toLowerCase() === 'admin').length;
  const patientCount = users.filter(u => u.role?.toLowerCase() === 'patient' || !u.role).length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white p-6 md:p-12 relative overflow-hidden'>
      {/* Decorative background glow */}
      <div className='absolute -top-40 -right-40 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse'></div>
      <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000'></div>

      <div className='max-w-6xl mx-auto relative z-10'>
        {/* Header */}
        <header className='flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 pb-6 border-b border-violet-500/20'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <div className='bg-violet-500/20 text-violet-400 p-2.5 rounded-lg border border-violet-500/30'>
                <FaTasks size={28} />
              </div>
              <span className='bg-violet-500/10 text-violet-300 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase'>
                Admin Portal
              </span>
            </div>
            <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>Welcome, Admin {user.fullname}</h1>
            <p className='text-gray-400 text-sm mt-1'>Logged in from: {user.organization || 'Central Administration'}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className='cursor-pointer flex items-center gap-2 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-95'
          >
            <FaSignOutAlt />
            Logout
          </button>
        </header>

        {/* Quick Stats Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
          {[
            { label: 'Total Registered', value: loading ? '...' : totalUsers, icon: <FaUsers className='text-violet-400' />, desc: `${patientCount} Patients` },
            { label: 'Staff Registered', value: loading ? '...' : staffCount, icon: <FaUserMd className='text-fuchsia-400' />, desc: 'Outreach & clinical staff' },
            { label: 'System Admins', value: loading ? '...' : adminCount, icon: <FaUser className='text-pink-400' />, desc: 'Administrative accounts' },
            { label: 'Active Organizations', value: loading ? '...' : organizationsCount, icon: <FaClipboardList className='text-purple-400' />, desc: 'Registered medical centers' }
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

        {/* Error State */}
        {error && (
          <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-4 px-6 rounded-2xl mb-12 text-center'>
            {error}
          </div>
        )}

        {/* Dashboard Sections */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Area: User Directory */}
          <div className='lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-bold flex items-center gap-2'>
                <FaUsers className='text-violet-400' />
                User Profiles Directory
              </h2>
            </div>
            
            {loading ? (
              <div className='text-center py-12 text-gray-500 text-sm'>
                Fetching registered users...
              </div>
            ) : users.length === 0 ? (
              <div className='text-center py-12 text-gray-500 text-sm'>
                No user accounts registered.
              </div>
            ) : (
              <div className='space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
                {users.map((profile, idx) => (
                  <div key={profile.id || idx} className='flex flex-col sm:flex-row justify-between sm:items-center bg-white/5 border border-white/5 hover:border-violet-500/20 rounded-xl p-4 gap-4 hover:bg-white/10 transition-all duration-300'>
                    <div>
                      <div className='flex items-center gap-2.5 mb-1'>
                        <h3 className='font-semibold'>{profile.fullname}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                          profile.role === 'admin' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' :
                          profile.role === 'staff' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {profile.role || 'patient'}
                        </span>
                      </div>
                      <p className='text-xs text-gray-400'>ID: {profile.identity?.trim()}</p>
                      {profile.organization && (
                        <p className='text-xs text-violet-300/80 font-medium mt-1'>
                          Org: {profile.organization}
                        </p>
                      )}
                    </div>
                    <div className='text-left sm:text-right border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0'>
                      <p className='text-xs text-gray-400'>{profile.email || 'No email registered'}</p>
                      <p className='text-xs text-gray-400 mt-0.5'>{profile.phone_number?.trim()}</p>
                      <span className='text-[10px] text-gray-500 block mt-1.5'>
                        Joined: {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Area: Admin Tools */}
          <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'>
            <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
              <FaMedkit className='text-fuchsia-400' />
              Admin Controls
            </h2>
            <div className='space-y-3'>
              {['Manage System Roles', 'Generate System Audit Log', 'Security Compliance Log', 'System Environment Diagnostics'].map((tool, idx) => (
                <button key={idx} className='cursor-pointer w-full text-left bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/20 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]'>
                  {tool}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
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