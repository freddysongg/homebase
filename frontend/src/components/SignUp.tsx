'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Signing up with:', { name, email, password });

    // API call for registration
  };

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <div className="bg-black p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="block text-sm font-medium">Full Name</div>
            <input
              type="text"
              className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="block text-sm font-medium">Email</div>
            <input
              type="email"
              className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="block text-sm font-medium">Password</div>
            <input
              type="password"
              className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition p-2 rounded-md font-bold"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">Already have an account?</p>
          <Link href="/login">
            <button className="mt-2 w-full bg-gray-600 hover:bg-gray-700 transition p-2 rounded-md font-bold">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
