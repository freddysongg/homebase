'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending login request...');
      const response = await fetch(`http://localhost:5001/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify([...response.headers]));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Login failed. Please try again.');
      }

      const data = await response.json();
      console.log('Login successful:', data);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }

      router.push('/homes');
    } catch (error) {
      const err = error as Error; // Type assertion
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    alert('Feature coming soon');
  };

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <div className="bg-black p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-500 text-white rounded-md text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-green-500 hover:bg-green-600 transition p-2 rounded-md font-bold disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 transition p-2 rounded-md font-bold"
          >
            <Image src="/google.png" alt="Google Logo" width={20} height={20} className="mr-2" />
            Sign in with Google
          </button>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">Don&apos;t have an account?</p>
          <Link href="/signup">
            <button className="mt-2 w-full bg-gray-600 hover:bg-gray-700 transition p-2 rounded-md font-bold">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
