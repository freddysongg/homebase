'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const HomeDetails = ({ homeCode }: { homeCode: string }) => {
  const searchParams = useSearchParams();
  const homeName = searchParams.get('name');
  const homeAddress = searchParams.get('address');
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    // implement call to fetch members
    setTimeout(() => {
      setMembers(['User1', 'User2', 'User3']);
    }, 1000);
  }, []);

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
