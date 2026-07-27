import React from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { FaUserMd, FaUser, FaUsers, FaCalendarAlt, FaPrescriptionBottle, FaClipboardList, FaPlus, FaHeartbeat, FaRunning, FaTint, FaSignOutAlt, FaMedkit, FaFileMedicalAlt, FaTasks,FaExchangeAlt,FaStar,FaComments,FaClock,FaHospital,FaShieldAlt,FaPlusCircle,FaPaperPlane,FaBell,FaCheck } from 'react-icons/fa';
const ChatRoom = ({ user, socket, chatMessages, contacts, setChatMessages }) => {
  // State for the currently selected contact
  const [selectedContact, setSelectedContact] = React.useState(null);
  // State for the current message input
  const [messageInput, setMessageInput] = React.useState('');
  // Reference to the chat container for auto-scrolling
  const chatContainerRef = React.useRef(null);
  // Local messages for the current conversation
  const [localMessages, setLocalMessages] = React.useState([]);
  // Track if messages have been marked as read for the current conversation
  const [hasMarkedRead, setHasMarkedRead] = React.useState(false);

  // Determine the user's role and create a unique chat ID
  const role = user.role?.toLowerCase();
  const myChatId = `${role === 'admin' || role === 'staff' ? 'user' : role}_${user.id}`;

  /**
   * Get role-based color scheme for UI theming
   * Each role has distinct colors for visual differentiation
   */
  const getRoleColors = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          primaryBg: 'bg-violet-500',
          primaryHover: 'hover:bg-violet-600',
          bubbleBg: 'bg-violet-600',
          text: 'text-violet-400',
          focusBorder: 'focus:border-violet-500'
        };
      case 'staff':
        return {
          primaryBg: 'bg-emerald-500',
          primaryHover: 'hover:bg-emerald-600',
          bubbleBg: 'bg-emerald-600',
          text: 'text-emerald-400',
          focusBorder: 'focus:border-emerald-500'
        };
      case 'chw':
        return {
          primaryBg: 'bg-orange-500',
          primaryHover: 'hover:bg-orange-600',
          bubbleBg: 'bg-orange-600',
          text: 'text-orange-400',
          focusBorder: 'focus:border-orange-500'
        };
      case 'patient':
      default:
        return {
          primaryBg: 'bg-purple-500',
          primaryHover: 'hover:bg-purple-600',
          bubbleBg: 'bg-purple-600',
          text: 'text-purple-400',
          focusBorder: 'focus:border-purple-500'
        };
    }
  };

  const colors = getRoleColors(user.role);

  /**
   * Filter messages for the current conversation
   * Includes direct messages, group announcements, and admin broadcasts
   */
  const getActiveMessages = React.useCallback(() => {
    if (!selectedContact) return [];
    
    return chatMessages.filter(m => {
      // 1. Direct messages between two users
      if (m.sender === myChatId && m.recipient === selectedContact?.chat_id) return true;
      if (m.sender === selectedContact?.chat_id && m.recipient === myChatId) return true;

      // 2. Admin to Group announcements (visible in conversation log with the sending admin)
      if (selectedContact?.role === 'admin' && m.sender === selectedContact?.chat_id) {
        const org = user.organization?.toLowerCase().trim();
        if (org) {
          if (m.recipient === `all_patients_${org}` && role === 'patient') return true;
          if (m.recipient === `all_staff_${org}` && role === 'staff') return true;
        }
      }

      // 3. For admin viewing their own sent group messages in the group virtual chat
      if (role === 'admin' && selectedContact?.role === 'group') {
        if (m.sender === myChatId && m.recipient === selectedContact?.chat_id) return true;
      }

      return false;
    });
  }, [chatMessages, selectedContact, myChatId, user.organization, role]);

  /**
   * Get the count of unread messages from a specific contact
   * This function is used to display the unread badge on contacts
   */
  const getUnreadCount = (contactChatId) => {
    return chatMessages.filter(m => 
      m.sender === contactChatId && 
      m.recipient === myChatId && 
      !m.read
    ).length;
  };

  /**
   * Mark all unread messages from the current contact as read
   * This function is called when a conversation is opened
   * It ensures the unread badge is removed from the contact
   */
  const markMessagesAsRead = React.useCallback(() => {
    if (!selectedContact || !socket || hasMarkedRead) return;

    // Find all unread messages from this contact
    const unreadMessages = chatMessages.filter(m => 
      m.sender === selectedContact.chat_id && 
      m.recipient === myChatId && 
      !m.read
    );

    // Only proceed if there are unread messages
    if (unreadMessages.length > 0) {
      // Emit event to server to mark messages as read
      socket.emit('mark_messages_read', {
        sender: selectedContact.chat_id,
        recipient: myChatId
      });

      // Update local chatMessages state to mark them as read
      // This will trigger a re-render and remove the unread badge
      if (setChatMessages) {
        setChatMessages(prev => 
          prev.map(msg => 
            msg.sender === selectedContact.chat_id && 
            msg.recipient === myChatId && 
            !msg.read
              ? { ...msg, read: true }
              : msg
          )
        );
      }

      // Prevent multiple mark read calls for the same conversation
      setHasMarkedRead(true);
    }
  }, [selectedContact, socket, chatMessages, myChatId, hasMarkedRead, setChatMessages]);

  /**
   * Update local messages whenever chatMessages or selectedContact changes
   * This ensures the conversation view stays in sync with the global state
   */
  React.useEffect(() => {
    const filtered = getActiveMessages();
    setLocalMessages(filtered);
  }, [chatMessages, selectedContact, getActiveMessages]);

  /**
   * Mark messages as read when a contact is selected
   * This triggers the read receipt process for the opened conversation
   * The unread badge will be removed once messages are marked as read
   */
  React.useEffect(() => {
    if (selectedContact) {
      // Reset the mark read flag when a new contact is selected
      setHasMarkedRead(false);
      // Mark messages as read for the selected contact
      markMessagesAsRead();
    }
  }, [selectedContact, markMessagesAsRead]);

  /**
   * Auto-scroll to the bottom of the chat when new messages arrive
   * This provides a smooth user experience when receiving or sending messages
   */
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [localMessages]);

  /**
   * Handle sending a new message
   * Implements optimistic updates for immediate UI feedback
   */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedContact || !socket) return;

    // Create a new message object with optimistic ID and timestamp
    const newMessage = {
      id: Date.now().toString(),
      sender: myChatId,
      senderName: user.fullname,
      recipient: selectedContact.chat_id,
      message: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true // Messages we send are immediately marked as read
    };

    // Optimistically add message to local state for immediate display
    setLocalMessages(prev => [...prev, newMessage]);

    // Emit the message to the server via Socket.IO
    socket.emit('send_message', {
      sender: myChatId,
      senderName: user.fullname,
      recipient: selectedContact.chat_id,
      message: messageInput.trim()
    });

    // Clear the input field
    setMessageInput('');
  };

  return (
    <div className='max-w-6xl mx-auto h-[550px] flex bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl'>
      {/* Contact List Sidebar - Shows all available contacts with unread badges */}
      <div className='w-1/3 border-r border-white/10 flex flex-col bg-black/20'>
        <div className='p-4 border-b border-white/10'>
          <h2 className='text-sm font-bold flex items-center gap-2'>
            <FaComments className={colors.text} />
            Conversations
          </h2>
        </div>
        <div className='flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1'>
          {contacts.map(contact => {
            // Get the count of unread messages for this contact
            const unreadCount = getUnreadCount(contact.chat_id);
            // Check if this contact is currently selected
            const isSelected = selectedContact?.chat_id === contact.chat_id;
            
            return (
              <button
                key={contact.chat_id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full text-left p-3 rounded-xl flex flex-col transition-all duration-300 ${
                  isSelected
                    ? `${colors.primaryBg} text-black font-semibold` // Highlight selected contact
                    : unreadCount > 0
                      ? 'bg-white/10 hover:bg-white/15 text-gray-200 border border-amber-500/30' // Highlight contacts with unread messages
                      : 'hover:bg-white/5 text-gray-300' // Normal state
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className='text-xs font-bold truncate flex-1'>{contact.fullname}</span>
                  {/* Display unread count badge - only show if there are unread messages and contact is not selected */}
                  {unreadCount > 0 && !isSelected && (
                    <span className="ml-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-wider truncate ${
                  isSelected ? 'text-black/70' : 'text-gray-500'
                }`}>
                  {contact.role} - {contact.organization}
                </span>
              </button>
            );
          })}
          {contacts.length === 0 && (
            <div className='text-center py-8 text-gray-500 text-xs'>
              No contacts found.
            </div>
          )}
        </div>
      </div>

      {/* Chat Message Window - Displays the selected conversation */}
      <div className='flex-1 flex flex-col bg-black/40'>
        {selectedContact ? (
          <>
            {/* Chat Header - Shows contact info */}
            <div className='p-4 border-b border-white/10 bg-white/5 flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-bold text-white'>{selectedContact.fullname}</h3>
                <span className='text-[10px] text-gray-400 uppercase tracking-wider'>{selectedContact.role}</span>
              </div>
              {/* No "New messages" text displayed here */}
            </div>

            {/* Chat Messages Container - Auto-scrolling message list */}
            <div ref={chatContainerRef} className='flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3'>
              {localMessages.map((msg, index) => {
                const isMe = msg.sender === myChatId;
                // Show sender name only for the first message from each sender in a sequence
                const showSenderName = !isMe && (index === 0 || localMessages[index - 1]?.sender !== msg.sender);
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-xs ${
                      isMe 
                        ? `${colors.bubbleBg} text-white rounded-tr-none` 
                        : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                    }`}>
                      {/* Show sender name for incoming messages from different senders */}
                      {!isMe && showSenderName && (
                        <span className="block text-[8px] font-bold text-gray-400 mb-1">
                          {msg.senderName || 'Unknown'}
                        </span>
                      )}
                      <p className="break-words">{msg.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className='text-[8px] opacity-60'>
                          {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {/* Read receipts for sent messages */}
                        {isMe && msg.read && (
                          <span className="text-[8px] text-emerald-400">✓✓</span>
                        )}
                        {isMe && !msg.read && (
                          <span className="text-[8px] text-gray-400">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {localMessages.length === 0 && (
                <div className='text-center py-20 text-gray-500 text-xs'>
                  No messages yet. Send a message to start the conversation!
                </div>
              )}
            </div>

            {/* Message Input Form - For sending new messages */}
            <form onSubmit={handleSendMessage} className='p-4 border-t border-white/10 bg-white/5 flex gap-2'>
              <input
                type='text'
                placeholder={`Type a message to ${selectedContact.fullname}...`}
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                className={`flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none ${colors.focusBorder} text-xs`}
                required
              />
              <button
                type='submit'
                className={`${colors.primaryBg} ${colors.primaryHover} text-black p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer`}
              >
                <FaPaperPlane size={14} />
              </button>
            </form>
          </>
        ) : (
          // Empty state when no contact is selected
          <div className='flex-1 flex flex-col items-center justify-center text-gray-500 p-8'>
            <FaComments size={40} className='mb-4 text-gray-600' />
            <p className='text-sm'>Select a contact from the left panel to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
