import React from 'react';
import { FaCheckCircle, FaTimes, FaPaperPlane } from 'react-icons/fa';

const ContactSection = ({
  contactEmail,
  setContactEmail,
  contactSubject,
  setContactSubject,
  contactMessage,
  setContactMessage,
  contactStatus,
  handleContactSubmit
}) => {
  return (
    <section id='contact' className='py-24 px-6 md:px-12 bg-[#090C0E] border-b border-white/5 relative'>
      <div className='max-w-3xl mx-auto'>
        {/* Section Header */}
        <div className='text-center mb-16 space-y-2'>
          <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>Contact Us</h2>
          <p className='text-gray-400 text-sm md:text-base'>Feel free to reach out to us</p>
          <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
        </div>

        {contactStatus && (
          <div className={`border rounded-xl p-4 mb-6 text-center text-sm font-semibold flex items-center justify-center gap-2 ${
            contactStatus.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {contactStatus.type === 'success' ? <FaCheckCircle /> : <FaTimes />}
            {contactStatus.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleContactSubmit} className='space-y-6 bg-[#0D1115] border border-white/10 p-8 rounded-3xl shadow-xl'>
          <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
            <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider'>Email:</label>
            <div className='md:col-span-9'>
              <input 
                type="email"
                placeholder="name@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-12 items-center gap-4'>
            <label className='md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider'>Subject Line:</label>
            <div className='md:col-span-9'>
              <input 
                type="text"
                placeholder="Enter message subject"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Message:</label>
            <textarea 
              rows="5"
              placeholder="Type your message here..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className='w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm resize-none'
            ></textarea>
          </div>

          <div className='flex justify-end pt-2'>
            <button 
              type="submit"
              className='cursor-pointer bg-white text-black hover:bg-green-500 hover:text-black font-extrabold px-8 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 text-sm shadow-md'
            >
              <FaPaperPlane size={12} />
              SEND
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
