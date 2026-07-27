// --- Reusable Appointments Section Component ---
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck } from 'react-icons/fa';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // Target the backend server
// const API_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true; // This will allow axios to send cookies with requests, which is necessary for session management
 
const AppointmentsSection = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRecordPatientId, setViewRecordPatientId] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [careGivers, setCareGivers] = useState([]);
  
  const [newAppointment, setNewAppointment] = useState({
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

  useEffect(() => {
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

  useEffect(() => {
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
    if (!newAppointment.organization || !newAppointment.reason || !newAppointment.date) {
      alert("Please fill in all required fields.");
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    if (newAppointment.date < todayStr) {
      alert("Appointment date cannot be in the past.");
      return;
    }

    try {
      const date_time = newAppointment.time ? `${newAppointment.date}T${newAppointment.time}` : `${newAppointment.date}T00:00:00`;
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

  if (viewRecordPatientId) {
    return (
      <div className="animate-in fade-in duration-200">
        <HealthRecordSection 
          patientId={viewRecordPatientId} 
          role={user.role} 
          onClose={() => setViewRecordPatientId(null)} 
        />
      </div>
    );
  }

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
                <div 
                  key={app.id} 
                  onClick={() => {
                    if (['admin', 'staff', 'chw'].includes(user.role?.toLowerCase()) && Number(app.visitor_id) !== 0) {
                      setViewRecordPatientId(app.visitor_id);
                    }
                  }}
                  className={`bg-white/5 border border-white/5 hover:border-violet-500/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${['admin', 'staff', 'chw'].includes(user.role?.toLowerCase()) && Number(app.visitor_id) !== 0 ? 'cursor-pointer' : ''}`}
                >
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
                    {app.contact_email && <p className='text-xs text-gray-400 mt-0.5'><span className='font-semibold text-gray-500'>Email:</span> {app.contact_email}</p>}
                    {app.contact_phone && <p className='text-xs text-gray-400 mt-0.5'><span className='font-semibold text-gray-500'>Phone:</span> {app.contact_phone}</p>}
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
                    <div className='flex gap-2 shrink-0 md:flex-col w-full md:w-auto' onClick={e => e.stopPropagation()}>
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
                      {app.status !== 'fulfilled' && (isCreator || isAdminOfOrg || isAssignedCaregiver) && (
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
              <label className='block text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider'>Time</label>
              <input 
                type="time" 
                value={newAppointment.time} 
                onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })} 
                className='w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs' 
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

export default AppointmentsSection;
