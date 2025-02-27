'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { features } from '@/data/features';

const About = () => {
  return (
    <div className="my-7">
      <div className="bg-black py-20 text-white p-12 rounded-3xl max-w-screen mx-3">
        <h2 className="text-5xl font-extrabold text-center mb-14">
          Optimize Your Home Experience 
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-item flex space-x-4"
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;