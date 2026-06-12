// ================== Registration Page Component ==================
import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaEnvelope, FaLock, FaIdCard, FaPhone } from 'react-icons/fa';

const Register = ({ setUser }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullname: '',
        identity: '',
        phone_number: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.post('/api/auth/register', form);
            setUser(res.data.user);
            navigate('/dashboard');
        }catch(err){
            setError(err.response?.data?.message || "Failed to register");
        }
    };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500'></div>
      </div>
      
      <form onSubmit={handleSubmit} className='relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-96 border border-white/20'>
        <button onClick={()=>navigate('/')} className='absolute top-4 left-4 text-white/70 hover:text-white transition-all duration-300 hover:scale-110'>
          <FaHome size={24}/>
        </button>
        
        <div className='text-center mb-8'>
          <h2 className='text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'>Register</h2>
          <div className='h-1 w-20 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto mt-2 rounded-full'></div>
        </div>
        
        {error && <p className='text-red-400 text-sm mb-4 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20'>{error}</p>}
        
        <div className='space-y-4'>
          <div className='relative'>
            <FaUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input 
              type="text" 
              placeholder='Full Name' 
              value={form.fullname} 
              onChange={(e)=>setForm({...form, fullname: e.target.value})}
              className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300'
            />
          </div>

          <div className='relative'>
            <FaIdCard className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input 
              type="text" 
              placeholder='ID or Passport Number' 
              value={form.identity} 
              onChange={(e)=>setForm({...form, identity: e.target.value})}
              className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300'
            />
          </div>

          <div className='relative'>
            <FaPhone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input 
              type="text" 
              placeholder='Phone Number' 
              value={form.phone_number} 
              onChange={(e)=>setForm({...form, phone_number: e.target.value})}
              className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300'
            />
          </div>
          
          <div className='relative'>
            <FaEnvelope className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input 
              type="email" 
              placeholder='Email (Optional)' 
              value={form.email} 
              onChange={(e)=>setForm({...form, email: e.target.value})}
              className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300'
            />
          </div>
          
          <div className='relative'>
            <FaLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input 
              type="password" 
              placeholder='Password' 
              value={form.password} 
              onChange={(e)=>setForm({...form, password: e.target.value})}
              className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300'
            />
          </div>
          
          <button 
            type="submit" 
            className="cursor-pointer w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-cyan-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Register
          </button>
        </div>
        
        <p className='text-center text-gray-300 mt-6'>
          Already have an account? 
          <span 
            className='text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text cursor-pointer font-semibold hover:from-purple-300 hover:to-cyan-300 transition-all duration-300 ml-1' 
            onClick={()=>navigate('/login')}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  )
}

export default Register