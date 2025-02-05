'use client';

import React, { useEffect } from 'react';
import { animate } from 'motion';
import { features } from '@/data/features';

const About = () => {
  useEffect(() => {
    const featureElements = document.querySelectorAll('.feature-item');

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            animate(
              entry.target,
              { y: [50, 0], opacity: [0, 1] },
              { delay: index * 0.2, duration: 0.6, easing: 'ease-out' }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    featureElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="my-7">
      <div className="bg-black py-20 text-white p-12 rounded-3xl max-w-screen mx-3">
        <h2 className="text-5xl font-extrabold text-center mb-14">
          Optimize Your Home Experience 🚀
        </h2>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="feature-item flex space-x-4 opacity-0">
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
