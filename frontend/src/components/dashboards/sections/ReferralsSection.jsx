// --- Reusable Referrals Section Component ---
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck } from 'react-icons/fa';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // Target the backend server
// const API_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true; // This will allow axios to send cookies with requests, which is necessary for session management

const ReferralsSection = ({ user }) => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [chws, setChws] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [choiceReferral, setChoiceReferral] = useState(null);
  const [viewRecordPatientId, setViewRecordPatientId] = useState(null);
  
  // Dynamic staff members for selected destination organization
  const [staffList, setStaffList] = useState([]);
  const [editStaffList, setEditStaffList] = useState([]);

  // Predefined departments list
  const DEPARTMENTS = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'General Medicine', 'Neurology', 'Obstetrics & Gynecology',
    'Oncology', 'Ophthalmology', 'Orthopedics', 'Pediatrics',
    'Psychiatry', 'Radiology', 'Surgery', 'Urology', 'Other'
  ];

  // Creation form state
  const [newReferral, setNewReferral] = useState({
    patient_id: '',
    organization_to: '',
    department_to: '',
    custom_department: '',
    staff_to: '',
    reason: '',
    arrival_date: ''
  });

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
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
  const canManage = user.role?.toLowerCase() !== 'patient';

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

  useEffect(() => {
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
  useEffect(() => {
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
  useEffect(() => {
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

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const referralDateStr = newReferral.arrival_date.substring(0, 10);
    if (referralDateStr < todayStr) {
      alert("Referral arrival date cannot be in the past.");
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

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const referralDateStr = editForm.arrival_date.substring(0, 10);
    if (referralDateStr < todayStr) {
      alert("Referral arrival date cannot be in the past.");
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
      doc.setFontSize(65);
      doc.text(orgFrom.toUpperCase(), 15, 270, { angle: 53 });

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
              {referrals.map(ref => {
                const isReceiver = (user.organization && ref.organization_to && user.organization.trim().toLowerCase() === ref.organization_to.trim().toLowerCase()) ||
                                   (user.fullname && ref.staff_to && user.fullname.trim().toLowerCase() === ref.staff_to.trim().toLowerCase());
                return (
                  <div 
                    key={ref.id} 
                    className={`bg-white/5 border border-white/5 hover:${colors.border} rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
                  >
                  {/* Clickable details area */}
                  <div 
                    onClick={() => {
                      if (canManage) {
                        setChoiceReferral(ref);
                      } else {
                        setSelectedReferral(ref);
                      }
                    }}
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
                        {Number(ref.referrer_id) === Number(user.id) && !isReceiver && (
                          <>
                            {ref.status !== 'fulfilled' && (
                              <button 
                                onClick={() => handleStartEdit(ref)}
                                className='cursor-pointer flex-1 md:flex-initial bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/10 transition-all duration-300'
                              >
                                Edit
                              </button>
                            )}
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
                );
              })}
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
              {['admin', 'staff'].includes(user.role?.toLowerCase()) && selectedReferral.status !== 'fulfilled' && (
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
      {/* Choice Modal for Admin/Staff */}
      {choiceReferral && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300'>
          <div className='bg-[#0c0f13] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200 text-center text-white'>
            <h3 className='text-base font-black tracking-tight text-white mb-2'>Select Action</h3>
            <p className='text-xs text-gray-400 mb-6'>Choose how you want to interact with referral for {choiceReferral.patient_name || choiceReferral.patient_id}</p>
            <div className='space-y-3'>
              <button 
                onClick={() => {
                  setViewRecordPatientId(choiceReferral.patient_id);
                  setChoiceReferral(null);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold ${colors.primaryBg} text-black ${colors.primaryHover} transition-all duration-300 hover:scale-[1.02]`}
              >
                View Patient Health Record
              </button>
              <button 
                onClick={() => {
                  setSelectedReferral(choiceReferral);
                  setChoiceReferral(null);
                }}
                className='w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]'
              >
                View Referral Ticket Details
              </button>
              <button 
                onClick={() => setChoiceReferral(null)}
                className='w-full py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-300'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralsSection;
