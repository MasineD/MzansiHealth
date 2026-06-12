import React from 'react';
import { FaHospital } from 'react-icons/fa';

const AboutSection = ({ hospitals }) => {
  return (
    <section id='about' className='py-24 px-6 md:px-12 bg-[#0C0F11] border-b border-white/5 relative'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <div className='text-center mb-16 space-y-2'>
          <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>About</h2>
          <p className='text-gray-400 text-sm md:text-base'>A brief summary of UbuntuHealth</p>
          <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16'>
          {/* Left Info Panel */}
          <div className='lg:col-span-7 space-y-8'>
            <div className='space-y-4'>
              <h3 className='text-2xl font-black text-green-500 uppercase tracking-wider'>Mission</h3>
              <p className='text-gray-300 leading-relaxed text-base'>
                A mission statement about the application. Also include the vision and why people should choose UbuntuHealth. Connecting public clinics and patients through immediate digital tracking, making referrals fast, transparent, and accurate.
              </p>
            </div>

            <div className='space-y-4'>
              <h3 className='text-xl font-bold text-white uppercase tracking-wider'>Key Features</h3>
              <div className='flex flex-wrap gap-3'>
                {['Feature 1 (Prescriptions)', 'Feature 2 (Referrals)', 'Feature 3 (Consults)'].map((feat, idx) => (
                  <span key={idx} className='bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm'>
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Supporting Medical Graphic SVG */}
          <div className='lg:col-span-5 flex justify-center'>
            <div className='bg-[#090C0E] border border-white/10 rounded-3xl p-8 w-full max-w-md h-80 flex flex-col items-center justify-center shadow-lg transition-transform duration-300 hover:scale-[1.02] border-dashed border-green-500/20 relative group overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              
              {/* Custom Medical SVG Icon Graphic */}
              <svg className='w-28 h-28 text-green-500 mb-4 animate-float' fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0112 3m0 0c2.917 0 5.747.294 8.5.862m-21 1.402a48.556 48.556 0 013.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <span className='text-xs font-bold text-gray-500 uppercase tracking-widest text-center px-4'>
                An image that supports the mission statement
              </span>
            </div>
          </div>
        </div>

        {/* Hospital Carousel at bottom of About */}
        <div className='relative w-full overflow-hidden mask-gradient border-t border-white/5 pt-8'>
          <div className='animate-scroll gap-4 flex'>
            {[...hospitals].reverse().map((hosp, idx) => (
              <div key={`about-${idx}`} className='bg-white/5 border border-white/10 hover:border-green-500/30 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors duration-300'>
                <FaHospital className='text-green-500 text-xs' />
                <span>{hosp}</span>
              </div>
            ))}
            {hospitals.map((hosp, idx) => (
              <div key={`about-dup-${idx}`} className='bg-white/5 border border-white/10 hover:border-green-500/30 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors duration-300'>
                <FaHospital className='text-green-500 text-xs' />
                <span>{hosp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
