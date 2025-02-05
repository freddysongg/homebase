import React from 'react';
import Button from './Button';

const Landing = () => {
  return (
    <div className="py-60 flex flex-col items-center gap-7">
      <div className="text-center text-[58px] font-extrabold">Welcome to HomeBase</div>
      <div className="-mt-5 text-center text-xl text-gray-500">
        A Shared Home Management App for Roommates
      </div>
      <Button title="Get Started" link="/" />
    </div>
  );
};

export default Landing;
