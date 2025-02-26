import React from 'react';
import Button from './Button';

const Landing = () => {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/videoplayback.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50" />
      <div className="relative flex flex-col items-center gap-7 text-center">
        <h1 className="text-[58px] font-extrabold">Welcome to HomeBase</h1>
        <p className="-mt-5 text-xl text-gray-300">A Shared Home Management App for Roommates</p>
        <Button title="Get Started" link="/expense" />
      </div>
    </div>
  );
};

export default Landing;
