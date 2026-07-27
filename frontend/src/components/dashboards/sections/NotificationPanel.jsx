import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck } from 'react-icons/fa';

const NotificationPanel = ({ notifications, socket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id) => {
    if (socket) {
      socket.emit('mark_notification_read', id);
    }
  };

  return (
    <div className='relative z-50'>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className='cursor-pointer relative bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center'
      >
        <FaBell size={16} className={unreadCount > 0 ? 'text-amber-400 animate-bounce' : 'text-gray-400'} />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30'>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-3 w-80 bg-[#0c0f12] border border-white/10 rounded-2xl shadow-2xl p-4 text-left z-50 backdrop-blur-2xl'>
          <div className='flex justify-between items-center pb-3 border-b border-white/5 mb-3'>
            <h3 className='text-xs font-bold text-white'>Notifications</h3>
            <span className='text-[9px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-semibold'>{unreadCount} unread</span>
          </div>
          <div className='space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar'>
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  notif.read 
                    ? 'bg-white/5 border-white/5 opacity-60' 
                    : 'bg-white/10 border-white/10 hover:border-violet-500/20'
                }`}
              >
                <div className='flex justify-between items-start gap-2 mb-1'>
                  <h4 className={`text-xs font-extrabold ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h4>
                  {!notif.read && (
                    <button 
                      onClick={() => handleMarkRead(notif.id)}
                      className='cursor-pointer bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black p-1 rounded transition-all duration-200'
                      title="Mark as read"
                    >
                      <FaCheck size={8} />
                    </button>
                  )}
                </div>
                <p className='text-[10.5px] text-gray-400 leading-normal mb-1.5'>{notif.message}</p>
                <span className='text-[8px] text-gray-500 font-medium block'>{notif.timestamp}</span>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className='text-center py-8 text-gray-500 text-xs'>
                No notifications received.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
