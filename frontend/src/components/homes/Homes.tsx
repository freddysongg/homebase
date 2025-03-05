'use client';

import React, { useState } from 'react';

const Homes = () => {
  const [homeCode, setHomeCode] = useState('');
  const [homeName, setHomeName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateHome = () => {
    setShowCreateForm(true);
    setSuccessMessage(null);
    setError(null);
  };

  const handleSubmitCreateHome = () => {
    if (!homeName.trim() || !homeAddress.trim() || !homeCode.trim()) {
      setError('All fields are required.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    setTimeout(() => {
      setSuccessMessage(`Home "${homeName}" created! Invite others using the code: ${homeCode}`);
      setIsLoading(false);
      setShowCreateForm(false);
      setHomeName('');
      setHomeAddress('');
      setHomeCode('');
    }, 1000);
  };

  const handleJoinHome = () => {
    if (!homeCode.trim()) {
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
            className="bg-black hover:bg-blue-600 px-6 py-3 rounded-md font-bold transition"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Create a New Home'}
          </button>

          <div className="flex flex-col items-center">
            <input
              type="text"
              placeholder="Enter home code"
              className="p-2 rounded-md text-black border border-gray-600 w-64"
              value={homeCode}
              onChange={(e) => setHomeCode(e.target.value)}
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
              <label className="block text-sm font-medium">Home Code (for invitations)</label>
              <input
                type="text"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={homeCode}
                onChange={(e) => setHomeCode(e.target.value)}
                required
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
