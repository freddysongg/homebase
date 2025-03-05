'use client';

import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');

  const handleCreateHome = () => {
    setShowCreateForm(true);
    setSuccessMessage(null);
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
    setSuccessMessage(null);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }
      const decodedToken = jwtDecode(token) as { userId: string };
      const userId = decodedToken.userId;

      const response = await fetch('http://localhost:5001/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          house_code: homeCode,
          name: homeName,
          address: homeAddress,
          members: [userId]
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create home.');
      }
  
      const data = await response.json();
      setSuccessMessage(`Home "${data.name}" created! Invite others using the code: ${data.homeCode}`);
      setShowCreateForm(false);
      setHomeName('');
      setHomeAddress('');
      setHomeCode(generateHomeCode());
    } catch (error) {
      console.error('Error creating home:', error);
      const err = error as Error;
      setError(err.message || 'An error occurred while creating the home.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHome = () => {
    if (!joinCode.trim()) {
      setError('Please enter a valid home code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    setTimeout(() => {
      setSuccessMessage(`Feature coming soon: You would join a home using this code.`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6 text-black">Manage Your Home</h1>

      {successMessage && (
        <p className="mb-4 p-2 bg-green-500 text-white rounded">{successMessage}</p>
      )}
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
              onClick={handleJoinHome}
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
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Home Address</label>
              <input
                type="text"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Home ID</label>
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
