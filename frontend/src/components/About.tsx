import React from 'react';
import { features } from '@/data/features';

const About = () => {
  return (
    <div className="my-7">
      <div className="bg-black py-20 text-white p-12 rounded-3xl max-w-screen mx-3">
        <h2 className="text-5xl font-extrabold text-center mb-14">
          Optimize Your Home Experience 🚀
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="flex space-x-4">
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
