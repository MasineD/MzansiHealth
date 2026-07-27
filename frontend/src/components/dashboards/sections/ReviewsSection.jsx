import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck } from 'react-icons/fa';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL; // Target the backend server
// const API_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true; // This will allow axios to send cookies with requests, which is necessary for session management

const ReviewsSection = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

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

  useEffect(() => {
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

export default ReviewsSection;
