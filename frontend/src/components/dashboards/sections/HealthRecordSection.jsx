// ============ A reusable healthrecords component===========
import React from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck } from 'react-icons/fa';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // Target the backend server
// const API_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true; // This will allow axios to send cookies with requests, which is necessary for session management

const HealthRecordSection = ({ patientId, role, onClose }) => {
  const [data, setData] = React.useState({
    records: [],
    routines: [],
    appointments: [],
    referrals: [],
    organizationWatermark: 'Mzansi Health',
    patientInfo: null
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Filters state
  const [period, setPeriod] = React.useState('all');
  const [includeAppointments, setIncludeAppointments] = React.useState(false);
  const [includeReferrals, setIncludeReferrals] = React.useState(false);

  // Editing / adding state
  const [showAddRecord, setShowAddRecord] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState(null);
  const [newRecordData, setNewRecordData] = React.useState({
    blood_group: '', weight: '', height: '', temperature: '', blood_pressure: '', heart_rate: '',
    symptoms: '', allergies: '', diagnosis: '', procedures: '', admission_date: '', release_date: '',
    prescription: '', long_term_treatment: false, care_giver: ''
  });

  // Verification state (required for editing)
  const [verification, setVerification] = React.useState({ patient_name: '', fulfillment_key: '' });

  // Routine state
  const [showAddRoutine, setShowAddRoutine] = React.useState(null); // record_id
  const [editingRoutine, setEditingRoutine] = React.useState(null);
  const [routineData, setRoutineData] = React.useState({
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

  React.useEffect(() => {
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


export default HealthRecordSection;
