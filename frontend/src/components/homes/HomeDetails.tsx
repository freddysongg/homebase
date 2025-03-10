'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

const HomeDetails = ({ homeCode }: { homeCode: string }) => {
  const [homeName, setHomeName] = useState<string | null>(null);
  const [homeAddress, setHomeAddress] = useState<{
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchHouseholdDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found. Please log in again.');
        }

        // Extract userId from the token
        const decodedToken = jwtDecode(token) as { id: string };
        const userId = decodedToken.id;

        // Fetch user details to get the household ID
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
        console.log('User Data:', userData); // Debugging
        const householdId = userData.data?.household_id;

        if (!householdId) {
          throw new Error('User is not associated with any household.');
        }

        // Fetch the household details using the householdId
        const householdResponse = await fetch(
          `http://localhost:5001/api/households/${householdId}`,
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
        console.log('Household Data:', householdData); // Debugging

        setHomeName(householdData.data.name || 'Unknown Home');
        setHomeAddress(
          householdData.data.address || {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
          }
        );
        setMembers(
          Array.isArray(householdData.data.members)
            ? householdData.data.members.map((member: { name: string }) => member.name)
            : []
        );
      } catch (error) {
        console.error('Error fetching household details:', error);
        setError('Failed to fetch household details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouseholdDetails();
  }, [homeCode]);

  const handleLeaveHome = async () => {
    try {
      setIsLeaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      // Extract userId from token
      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      const userResponse = await fetch('http://localhost:5001/api/households/leaveHousehold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          homeCode,
          userId
        })
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Failed to remove member.');
      }

      setLeaveSuccess(true);

      setTimeout(() => {
        router.push('/homes');
      }, 1000);
    } catch (error) {
      console.error('Error leaving home:', error);
      setError('Failed to leave home. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6 text-black">Home Details</h1>
      <div className="bg-black p-6 rounded-lg shadow-md w-96">
        {isLoading ? (
          <p>Loading home details...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : leaveSuccess ? (
          <div className="text-center">
            <p className="text-green-500 text-xl font-bold">You have successfully left the home!</p>
            <p className="text-gray-300">Redirecting you to the homes page...</p>
          </div>
        ) : (
          <>
            <p className="text-xl font-bold">Home Name: {homeName}</p>
            <p className="text-lg">
              Address: {homeAddress.street}, {homeAddress.city}, {homeAddress.state}{' '}
              {homeAddress.zip}, {homeAddress.country}
            </p>
            <p className="text-lg">Home Code: {homeCode}</p>

            <h2 className="text-xl font-bold mt-4">👥 Members:</h2>
            <ul>
              {members.length === 0 ? (
                <p>No members found.</p>
              ) : (
                members.map((member, index) => <li key={index}>• {member}</li>)
              )}
            </ul>
            <button
              onClick={() => setShowConfirmation(true)} // Show confirmation modal on click
              className="w-full bg-red-600 hover:bg-red-700 transition p-2 rounded-md font-bold mt-4"
              disabled={isLeaving}
            >
              {isLeaving ? 'Leaving...' : 'Leave Home'}
            </button>
          </>
        )}
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-bold mb-2">Are you sure?</h2>
            <p className="mb-4">
              Do you really want to leave this home? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  handleLeaveHome();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Leave Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeDetails;
