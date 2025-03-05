import React from 'react'

const members = ['User1', 'User2', 'User3'];

function page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6 text-black">Home Details</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
        <p className="text-xl font-bold">Home Name: Test</p>
        <p className="text-lg">Address: Test</p>
        <p className="text-lg">Home Code: TEST123</p>

        <h2 className="text-xl font-bold mt-4">Members:</h2>
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
}

export default page