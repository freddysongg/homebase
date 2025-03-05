'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const HomeDetails = ({ homeCode }: { homeCode: string }) => {
  const searchParams = useSearchParams();
  const homeName = searchParams.get('name');
  const homeAddress = searchParams.get('address');
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    const fetchHouseholdDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found. Please log in again.');
        }
  
        // Step 1: Extract the userId from the token
        const decodedToken = jwtDecode(token) as { userId: string };
        const userId = decodedToken.userId;
  
        // Step 2: Fetch the user's details to get the householdId
        const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details.');
        }
  
        const userData = await userResponse.json();
        const householdId = userData.householdId;
  
        if (!householdId) {
          throw new Error('User is not associated with any household.');
        }
  
        // Step 3: Fetch the household details using the householdId
        const householdResponse = await fetch(`http://localhost:5001/api/households/${householdId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!householdResponse.ok) {
          throw new Error('Failed to fetch household details.');
        }
  
        const householdData = await householdResponse.json();
        setMembers(householdData.members); // Update the members state with the fetched data
      } catch (error) {
        console.error('Error fetching household details:', error);
        // Handle error (e.g., show an error message)
      }
    };
  
    fetchHouseholdDetails();
  }, [homeCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6 text-black">Home Details</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
        <p className="text-xl font-bold">Home Name: {homeName}</p>
        <p className="text-lg">Address: {homeAddress}</p>
        <p className="text-lg">Home Code: {homeCode}</p>

        <h2 className="text-xl font-bold mt-4">👥 Members:</h2>
        <ul>
          {members.length === 0 ? (
            <p>Loading members...</p>
          ) : (
            members.map((member, index) => <li key={index}>• {member}</li>)
          )}
        </ul>
      </div>
    </div>
  );
};

export default HomeDetails;
