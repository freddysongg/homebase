'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const generateHomeCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const Homes = () => {
  const [homeName, setHomeName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [homeCode, setHomeCode] = useState(generateHomeCode());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();

  const handleCreateHome = () => {
    setShowCreateForm(true);
    setError(null);
    setHomeCode(generateHomeCode());
  };

  const handleSubmitCreateHome = async () => {
    if (!homeName.trim() || !homeAddress.trim()) {
      setError('Please enter a home name and address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to create a home.');
      }

      // implement API call
      setTimeout(() => {
        router.push(
          `/home/${homeCode}?name=${encodeURIComponent(homeName)}&address=${encodeURIComponent(homeAddress)}`
        );
      }, 1000);
    } catch (error) {
      console.error('Error creating home:', error);
      setError('An error occurred while creating the home.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6 text-black">Manage Your Home</h1>

      {error && <p className="mb-4 p-2 bg-red-500 text-white rounded">{error}</p>}

      {!showCreateForm ? (
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleCreateHome}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-md font-bold transition"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Create a New Home'}
          </button>

          <div className="flex flex-col items-center">
            <input
              type="text"
              placeholder="Enter home code"
              className="p-2 rounded-md text-black border border-gray-600 w-64"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button
              onClick={() => router.push(`/home/${joinCode}`)}
              className="mt-2 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-md font-bold transition"
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join an Existing Home'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-black p-6 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold text-center mb-4">Create a New Home</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Home Name</label>
              <input
                type="text"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600"
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Home Address</label>
              <input
                type="text"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Generated Home Code</label>
              <input
                type="text"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 bg-gray-300 cursor-not-allowed"
                value={homeCode}
                disabled
              />
            </div>

            <button
              onClick={handleSubmitCreateHome}
              className="w-full bg-blue-500 hover:bg-blue-600 transition p-2 rounded-md font-bold disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Home...' : 'Create Home'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homes;
