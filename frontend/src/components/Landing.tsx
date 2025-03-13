'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/videoplayback.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center gap-8 text-center px-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
          Welcome to HomeBase
        </h1>
        <p className="text-xl text-gray-200 max-w-2xl">
          A Shared Home Management App for Roommates
        </p>
        <Button size="lg" className="text-lg px-8" asChild>
          <a href="/login">Get Started</a>
        </Button>
      </motion.div>
    </div>
  );
};

export default Landing;
