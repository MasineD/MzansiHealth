import React from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck } from 'react-icons/fa';
import AppointmentsSection from './AppointmentsSection';
import ChatRoom from './ChatRoom';
import HealthRecordSection from './HealthRecordSection';
import NotificationPanel from './NotificationPanel';
import ReferralsSection from './sections/ReferralsSection';
import ReviewsSection from './ReviewsSection';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // Target the backend server
// const API_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true; // This will allow axios to send cookies with requests, which is necessary for session management

const AdminDashboard = ({ user, handleLogout, socket, notifications, chatMessages, contacts }) => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [organizationsCount, setOrganizationsCount] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('overview');

  // --- Patients Database ---
  const [patients, setPatients] = React.useState([]);
  const [selectedPatientId, setSelectedPatientId] = React.useState(null);

  React.useEffect(() => {
    setSelectedPatientId(null);
  }, [activeTab]);


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
    nok_email: '',
    chw_id: ''
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


export default AdminDashboard;
