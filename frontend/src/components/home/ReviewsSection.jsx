import React from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewsSection = ({ reviews }) => {
  return (
    <section id='reviews' className='py-24 px-6 md:px-12 bg-[#0C0F11] border-b border-white/5 overflow-hidden relative'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <div className='text-center mb-16 space-y-2'>
          <h2 className='text-3xl md:text-5xl font-black tracking-tight text-white'>Reviews</h2>
          <p className='text-gray-400 text-sm md:text-base'>What users say about UbuntuHealth</p>
          <div className='h-1 w-20 bg-green-500 mx-auto mt-2 rounded-full'></div>
        </div>

        {/* Reviews Scrolling Carousel */}
        <div className='relative w-full overflow-hidden mask-gradient py-4'>
          <div className='animate-scroll gap-6 flex'>
            {/* First loop iteration */}
            {reviews.map((rev, idx) => (
              <div key={idx} className='bg-[#0D1115] border border-white/10 hover:border-green-500/20 rounded-3xl p-6 w-80 flex-shrink-0 flex flex-col justify-between transition-colors duration-300'>
                <div>
                  {/* Stars Block */}
                  <div className='flex items-center gap-1 mb-4'>
                    {[...Array(5)].map((_, starIdx) => (
                      <FaStar 
                        key={starIdx} 
                        className={starIdx < rev.stars ? 'text-yellow-500' : 'text-gray-700'} 
                        size={14}
                      />
                    ))}
                  </div>
                  <p className='text-gray-300 text-sm leading-relaxed mb-6 italic'>"{rev.text}"</p>
                </div>
                <div>
                  <h5 className='font-bold text-white text-sm'>{rev.name}</h5>
                  <p className='text-xs text-green-500 font-semibold mt-0.5'>{rev.profession}</p>
                </div>
              </div>
            ))}
            {/* Duplicated loop iteration */}
            {reviews.map((rev, idx) => (
              <div key={`dup-${idx}`} className='bg-[#0D1115] border border-white/10 hover:border-green-500/20 rounded-3xl p-6 w-80 flex-shrink-0 flex flex-col justify-between transition-colors duration-300'>
                <div>
                  {/* Stars Block */}
                  <div className='flex items-center gap-1 mb-4'>
                    {[...Array(5)].map((_, starIdx) => (
                      <FaStar 
                        key={starIdx} 
                        className={starIdx < rev.stars ? 'text-yellow-500' : 'text-gray-700'} 
                        size={14}
                      />
                    ))}
                  </div>
                  <p className='text-gray-300 text-sm leading-relaxed mb-6 italic'>"{rev.text}"</p>
                </div>
                <div>
                  <h5 className='font-bold text-white text-sm'>{rev.name}</h5>
                  <p className='text-xs text-green-500 font-semibold mt-0.5'>{rev.profession}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
