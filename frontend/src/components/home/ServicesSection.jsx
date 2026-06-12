import React from 'react';
import { FaHeartbeat } from 'react-icons/fa';

const ServicesSection = () => {
  return (
    <section id='service' className='py-24 px-6 md:px-12 bg-gradient-to-r from-emerald-950 via-[#090C0E] to-teal-950 animate-gradient border-b border-white/5 relative overflow-hidden'>
      {/* Particle circles */}
      <div className='absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full blur-3xl opacity-50 animate-pulse'></div>
      <div className='absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl opacity-50 animate-pulse delay-500'></div>

      <div className='max-w-7xl mx-auto relative z-10'>
        {/* Section Header */}
        <div className='text-center mb-16 space-y-2'>
          <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>Services</h2>
          <p className='text-gray-400 text-sm md:text-base'>Services offered by UbuntuHealth</p>
          <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-center'>
          {/* Left Service Cards */}
          <div className='lg:col-span-6 space-y-4'>
            {[
              { title: 'E-Consultation', desc: 'Consult qualified clinicians online instantly from anywhere.' },
              { title: 'Prescription Delivery', desc: 'Secure, fast logistics delivering prescriptions to your door.' },
              { title: 'Community Referrals', desc: 'Track and fast-track clinical referrals via Community Health Workers.' },
              { title: 'Patient Registry Log', desc: 'Safe storage and retrieval of digital clinical patient histories.' }
            ].map((service, idx) => (
              <div key={idx} className='bg-[#090C0E]/70 backdrop-blur-md border border-white/10 hover:border-green-500/30 rounded-2xl p-5 hover:scale-[1.01] transition-all duration-300 shadow-md group'>
                <div className='flex items-center gap-3.5 mb-2'>
                  <div className='bg-green-500/20 text-green-400 p-2 rounded-lg group-hover:bg-green-500 group-hover:text-black transition-colors duration-300'>
                    <FaHeartbeat size={16} />
                  </div>
                  <h4 className='text-lg font-bold text-white'>{service.title}</h4>
                </div>
                <p className='text-sm text-gray-400 pl-11'>{service.desc}</p>
              </div>
            ))}
          </div>

          {/* Right Section Description & Stats */}
          <div className='lg:col-span-6 space-y-8 lg:pl-6'>
            <div className='space-y-4'>
              <p className='text-gray-300 text-lg leading-relaxed font-normal'>
                Our platform offers a wide range of services, including but not limited to: E-Consultation, Prescription Delivery, Community Referrals, and Patient Registry Log. The statistics below show the number of clients we have served up to so far.
              </p>
            </div>

            <div className='h-px w-full bg-white/10'></div>

            {/* Statistics Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 text-center'>
              {[
                { value: '10+', label: 'Hospitals' },
                { value: '15+', label: 'Clinics' },
                { value: '355', label: 'Health Professionals' },
                { value: '1500+', label: 'Patients' }
              ].map((stat, idx) => (
                <div key={idx} className='space-y-1.5'>
                  <div className='text-3xl md:text-4xl font-black text-green-500 tracking-tight'>{stat.value}</div>
                  <div className='text-xs font-bold text-gray-400 uppercase tracking-widest'>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
