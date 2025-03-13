'use client';

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

const generateHomeCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const Homes = () => {
  const { theme } = useTheme();
  const [homeName, setHomeName] = useState('');
  const [homeAddress, setHomeAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [homeCode, setHomeCode] = useState(generateHomeCode());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkUserHome = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found. Please log in again.');
        }

        // Decode the token to get the user's ID
        const decodedToken = jwtDecode(token) as { id: string };
        const userId = decodedToken.id;

        if (!userId) {
          throw new Error('User ID not found in the token.');
        }

        // Fetch the logged-in user's details
        const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details.');
        }

        const userData = await userResponse.json();
        console.log('User Data:', userData); // Debugging: Log user data
        console.log('Type of household_id:', typeof userData.data.household_id);
        console.log('Value of household_id:', userData.data.household_id);

        // Check if the user has a household_id
        console.log('FLAG1');

        if (userData.data.household_id) {
          console.log('FLAG2');
          // Fetch the household details using the household_id
          const householdResponse = await fetch(
            `http://localhost:5001/api/households/${userData.data.household_id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!householdResponse.ok) {
            throw new Error('Failed to fetch household details.');
          }

          const householdData = await householdResponse.json();
          console.log('Household Data:', householdData); // Debugging: Log household data

          // Redirect to HomeDetails using the homeCode
          // router.push(`/homes/${householdData.data.house_code}`);
          window.location.replace(`/homes/${householdData.data.house_code}`);
        }
      } catch (error) {
        console.error('Error checking user home:', error);
        setError('Failed to check user home. Please try again.');
      }
    };

    checkUserHome();
  }, [router]);

  const handleCreateHome = () => {
    setShowCreateForm(true);
    setSuccessMessage(null);
    setError(null);
    setHomeCode(generateHomeCode());
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHomeAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCreateHome = async () => {
    if (
      !homeName.trim() ||
      !homeAddress.street.trim() ||
      !homeAddress.city.trim() ||
      !homeAddress.state.trim() ||
      !homeAddress.zip.trim() ||
      !homeAddress.country.trim()
    ) {
      setError('Please fill out all address fields.');
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

      // Decode the token to get the user's ID
      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      if (!userId) {
        throw new Error('User ID not found in the token.');
      }

      // Step 1: Create the home
      const createHomeResponse = await fetch('http://localhost:5001/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          house_code: homeCode,
          name: homeName,
          address: homeAddress,
          members: [userId]
        })
      });

      // Check if the response is OK (status code 200-299)
      if (!createHomeResponse.ok) {
        // Handle non-OK responses (e.g., 404, 500)
        const errorText = await createHomeResponse.text();
        console.error('Server Error:', errorText);
        throw new Error(`Failed to create home. Server responded with: ${errorText}`);
      }

      // Parse the response as JSON
      const homeData = await createHomeResponse.json();

      const homeId = homeData._id; // Get the newly created home's ID

      // Step 2: Update the user with the new home ID
      const updateUserResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          household_id: homeId // Add the home ID to the user's homeId field
        })
      });

      if (!updateUserResponse.ok) {
        const errorText = await updateUserResponse.text();
        console.error('Server Error:', errorText);
        throw new Error(`Failed to update user. Server responded with: ${errorText}`);
      }

      // Step 3: Redirect to HomeDetails using homeCode
      // router.push(`/homes/${homeData.house_code}`);
      window.location.replace(`/homes/${homeData.house_code}`);
    } catch (error) {
      console.error('Error creating home:', error);
      const err = error as Error;
      setError(err.message || 'An error occurred while creating the home.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHome = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a valid home code.');
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

      // Step 1: Decode the token to get the user ID
      const decodedToken = jwtDecode(token) as { userId: string };
      const userId = decodedToken.userId;

      // Step 2: Send the join code to the backend
      const response = await fetch('http://localhost:5001/api/households/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          homeCode: joinCode,
          userId // Include the user ID in the request body
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join household.');
      }

      const data = await response.json();

      // Step 3: Show success message
      setSuccessMessage(`Successfully joined home: ${data.data.name}`);

      setTimeout(() => {
        // router.push(`/homes/${joinCode}`);
        window.location.replace(`/homes/${joinCode}`);
      }, 1000);

      setJoinCode(''); // Clear the join code input
    } catch (error) {
      console.error('Error joining home:', error);
      const err = error as Error;
      setError(err.message || 'An error occurred while joining the home.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white my-10">
      <h1 className={`text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        Manage Your Home
      </h1>

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
              <label className="block text-sm font-medium">Street</label>
              <input
                type="text"
                name="street"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={homeAddress.street}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">City</label>
              <input
                type="text"
                name="city"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={homeAddress.city}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">State</label>
              <input
                type="text"
                name="state"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={homeAddress.state}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Zip Code</label>
              <input
                type="text"
                name="zip"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={homeAddress.zip}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Country</label>
              <input
                type="text"
                name="country"
                className="w-full mt-1 p-2 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={homeAddress.country}
                onChange={handleAddressChange}
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
