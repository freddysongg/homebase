'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const HomeDetails = ({ homeCode }: { homeCode: string }) => {
  const [homeName, setHomeName] = useState<string | null>(null);
  const [homeAddress, setHomeAddress] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        // Ensure members is always an array
        setHomeName(householdData.data.name || 'Unknown Home');
        setHomeAddress(householdData.address || 'Unknown Address');
        setMembers(Array.isArray(householdData.members) ? householdData.members : []);
      } catch (error) {
        console.error('Error fetching household details:', error);
        setError('Failed to fetch household details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouseholdDetails();
  }, [homeCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6 text-black">Home Details</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
        {isLoading ? (
          <p>Loading home details...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <p className="text-xl font-bold">Home Name: {homeName}</p>
            <p className="text-lg">Address: {homeAddress}</p>
            <p className="text-lg">Home Code: {homeCode}</p>

            <h2 className="text-xl font-bold mt-4">👥 Members:</h2>
            <ul>
              {members.length === 0 ? (
                <p>No members found.</p>
              ) : (
                members.map((member, index) => <li key={index}>• {member}</li>)
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeDetails;
