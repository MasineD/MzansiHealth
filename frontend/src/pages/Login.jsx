// ================= Login Page Component with Form Validation and API Integration =================
import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaEnvelope, FaLock, FaRocket } from 'react-icons/fa';

const Login = ({ setUser }) => {
    const navigate = useNavigate();
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');
    const [form, setForm] = useState({
        identity: '',
        password: ''
    });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.post('/api/auth/login', form);
            console.log(res.data.user);
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        }catch(err){
            setError(err.response?.data?.message || "Failed to login");
        }
    };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500'></div>
        
        {/* Floating particles */}
        <div className='absolute top-20 left-10 w-1 h-1 bg-white rounded-full animate-ping'></div>
        <div className='absolute bottom-20 right-10 w-1 h-1 bg-white rounded-full animate-ping delay-700'></div>
        <div className='absolute top-1/3 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse'></div>
      </div>
      
      <form onSubmit={handleSubmit} className='relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-96 border border-white/20 transform hover:scale-[1.02] transition-all duration-300'>
        <button onClick={()=>navigate('/')} className='absolute top-4 left-4 text-white/70 hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-12'>
          <FaHome size={24}/>
        </button>
        
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center mb-4'>
            <FaRocket className='text-4xl text-cyan-400 animate-bounce' />
          </div>
          <h2 className='text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>Welcome Back</h2>
          <div className='h-1 w-20 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mt-2 rounded-full'></div>
          <p className='text-gray-400 text-sm mt-3'>Sign in to continue</p>
        </div>
        
        {error && <p className='text-red-400 text-sm mb-4 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-shake'>{error}</p>}
        
        <div className='space-y-5'>
          <div className='relative group'>
            <FaEnvelope className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300' />
            <input 
              type="text" 
              placeholder='iD or Passport Number' 
              value={form.identity} 
              onChange={(e)=>setForm({...form, identity: e.target.value})}
              className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 group-hover:border-white/40'
            />
          </div>
          
          <div className='relative group'>
            <FaLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300' />
            <input 
              type="password" 
              placeholder='Password' 
              value={form.password} 
              onChange={(e)=>setForm({...form, password: e.target.value})}
              className='w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 group-hover:border-white/40'
            />
          </div>
          
          <button 
            type="submit" 
            className="cursor-pointer w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transform hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
          >
            <span className='relative z-10'>Login</span>
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500'></div>
          </button>
        </div>
        
        <p className='text-center text-gray-300 mt-6 text-sm'>
          Don't have an account? 
          <span 
            className='text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text cursor-pointer font-semibold hover:from-blue-300 hover:to-cyan-300 transition-all duration-300 ml-1' 
            onClick={()=>navigate('/register')}
          >
            Register here
          </span>
        </p>
      </form>
    </div>
  )
}

export default Login