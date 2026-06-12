import React from 'react';
import { 
  FaGoogle, FaEnvelope, FaLock, FaHospital, FaHeartbeat, FaUser, FaIdCard, FaPhone 
} from 'react-icons/fa';

const HeroSection = ({
  hospitals,
  isRegistering,
  setIsRegistering,
  identity,
  setIdentity,
  password,
  setPassword,
  loginError,
  setLoginError,
  loginLoading,
  handleSignIn,
  registerForm,
  setRegisterForm,
  registerError,
  setRegisterError,
  registerLoading,
  handleRegister
}) => {
  return (
    <section id='home' className='relative min-h-screen pt-28 pb-16 px-6 md:px-12 flex items-center justify-center border-b border-white/5'>
      {/* Glow Effects */}
      <div className='absolute top-20 left-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-30 animate-pulse'></div>
      <div className='absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl opacity-20 animate-pulse delay-1000'></div>

      <div className='max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'>
        {/* Slogan Left Block */}
        <div className='lg:col-span-7 space-y-6'>
          <h1 className='text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-white'>
            Healthcare for Everyone, <br />
            <span className='text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text'>
              Everywhere
            </span>
          </h1>
          
          <p className='text-gray-400 text-lg max-w-xl font-normal leading-relaxed'>
            Providing accessible, digital healthcare across communities. Check records, consult online, and log clinic referrals securely.
          </p>

          <div className='h-px w-full max-w-lg bg-gradient-to-r from-white/10 to-transparent'></div>

          {/* Trusted By Carousel */}
          <div className='space-y-4 pt-2'>
            <h4 className='text-xs font-bold text-gray-500 tracking-widest uppercase'>Trusted By:</h4>
            <div className='relative w-full overflow-hidden mask-gradient py-2'>
              <div className='animate-scroll gap-4 flex'>
                {/* First iteration */}
                {hospitals.map((hosp, idx) => (
                  <div key={idx} className='bg-white/5 border border-white/10 hover:border-green-500/30 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors duration-300'>
                    <FaHospital className='text-green-500 text-xs' />
                    <span>{hosp}</span>
                  </div>
                ))}
                {/* Duplicated for smooth loop */}
                {hospitals.map((hosp, idx) => (
                  <div key={`dup-${idx}`} className='bg-white/5 border border-white/10 hover:border-green-500/30 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors duration-300'>
                    <FaHospital className='text-green-500 text-xs' />
                    <span>{hosp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sign In / Register Widget Right Block */}
        <div className='lg:col-span-5 flex justify-center lg:justify-end'>
          <div className='bg-[#0D1115] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 transition-all duration-300 hover:border-green-500/20'>
            {!isRegistering ? (
              <>
                <h2 className='text-2xl font-black text-center mb-6 text-white tracking-tight'>Sign In</h2>
                
                {loginError && (
                  <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-2 px-3 rounded-lg mb-4 text-center'>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleSignIn} className='space-y-5'>
                  <div>
                    <label className='block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider'>ID Number</label>
                    <div className='relative'>
                      <FaEnvelope className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                      <input 
                        type="text"
                        placeholder="Enter identity number"
                        value={identity}
                        onChange={(e) => setIdentity(e.target.value)}
                        className='w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider'>Password</label>
                    <div className='relative'>
                      <FaLock className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                      <input 
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                      />
                    </div>
                  </div>

                  <div className='flex justify-between items-center text-xs font-semibold'>
                    <span className='text-gray-500 uppercase tracking-wide'>Continue with:</span>
                    <div className='flex items-center gap-3'>
                      <button type="button" className='cursor-pointer text-gray-400 hover:text-white flex items-center gap-1.5 border border-white/10 bg-white/5 py-1 px-2.5 rounded-lg text-[10px] transition-colors'>
                        <FaGoogle className='text-red-400' /> Google
                      </button>
                      <button type="button" className='cursor-pointer text-gray-400 hover:text-white flex items-center gap-1.5 border border-white/10 bg-white/5 py-1 px-2.5 rounded-lg text-[10px] transition-colors'>
                        <FaEnvelope className='text-green-400' /> Email
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loginLoading}
                    className='cursor-pointer w-full py-3.5 bg-green-500 hover:bg-green-600 text-black font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/10 hover:scale-[1.01] active:scale-95 text-sm flex items-center justify-center gap-2'
                  >
                    {loginLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                <p className='text-center text-gray-400 text-xs mt-6'>
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className='cursor-pointer text-green-400 hover:underline font-bold bg-transparent border-none p-0'
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className='text-2xl font-black text-center mb-4 text-white tracking-tight'>Register</h2>
                
                {/* Inline Role Selection Radio Buttons */}
                <div className='flex justify-center items-center gap-4 text-xs text-white/95 font-semibold mb-5 bg-white/5 py-2 px-3 rounded-xl border border-white/5'>
                  <label className='flex items-center gap-1.5 cursor-pointer hover:text-green-400 transition-colors'>
                    <input 
                      type="radio" 
                      name="role" 
                      value="patient"
                      checked={registerForm.role === 'patient'}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                      className='accent-green-500 cursor-pointer h-3.5 w-3.5'
                    />
                    <span>Patient</span>
                  </label>
                  <label className='flex items-center gap-1.5 cursor-pointer hover:text-green-400 transition-colors'>
                    <input 
                      type="radio" 
                      name="role" 
                      value="clinician"
                      checked={registerForm.role === 'clinician'}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                      className='accent-green-500 cursor-pointer h-3.5 w-3.5'
                    />
                    <span>Clinician</span>
                  </label>
                  <label className='flex items-center gap-1.5 cursor-pointer hover:text-green-400 transition-colors'>
                    <input 
                      type="radio" 
                      name="role" 
                      value="chw"
                      checked={registerForm.role === 'chw'}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                      className='accent-green-500 cursor-pointer h-3.5 w-3.5'
                    />
                    <span>CHW</span>
                  </label>
                </div>

                {registerError && (
                  <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-lg mb-4 text-center'>
                    {registerError}
                  </div>
                )}

                <form onSubmit={handleRegister} className='space-y-4'>
                  <div>
                    <div className='relative'>
                      <FaUser className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                      <input 
                        type="text"
                        placeholder="Full Name"
                        value={registerForm.fullname}
                        onChange={(e) => setRegisterForm({ ...registerForm, fullname: e.target.value })}
                        className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                      />
                    </div>
                  </div>

                  <div>
                    <div className='relative'>
                      <FaIdCard className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                      <input 
                        type="text"
                        placeholder="ID or Passport Number"
                        value={registerForm.identity}
                        onChange={(e) => setRegisterForm({ ...registerForm, identity: e.target.value })}
                        className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                      />
                    </div>
                  </div>

                  <div>
                    <div className='relative'>
                      <FaPhone className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                      <input 
                        type="text"
                        placeholder="Phone Number"
                        value={registerForm.phone_number}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone_number: e.target.value })}
                        className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                      />
                    </div>
                  </div>

                  <div>
                    <div className='relative'>
                      <FaEnvelope className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                      <input 
                        type="email"
                        placeholder="Email (Optional)"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                      />
                    </div>
                  </div>

                  <div>
                    <div className='relative'>
                      <FaLock className='absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500' />
                      <input 
                        type="password"
                        placeholder="Password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className='w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm'
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={registerLoading}
                    className='cursor-pointer w-full py-3 bg-green-500 hover:bg-green-600 text-black font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/10 hover:scale-[1.01] active:scale-95 text-sm flex items-center justify-center gap-2'
                  >
                    {registerLoading ? 'Registering...' : 'Register'}
                  </button>
                </form>

                <p className='text-center text-gray-400 text-xs mt-5'>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className='cursor-pointer text-green-400 hover:underline font-bold bg-transparent border-none p-0'
                  >
                    Sign In
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
