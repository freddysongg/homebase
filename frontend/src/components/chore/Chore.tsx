'use client';

import React, { useState } from 'react';

interface Chore {
  id: number;
  title: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

const Chore: React.FC = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [roommates, setRoommates] = useState<string[]>([]);
  const [newRoommate, setNewRoommate] = useState('');

  const handleAddRoommate = () => {
    if (!newRoommate.trim()) return;
    if (roommates.includes(newRoommate)) {
      alert('Roommate already exists!');
      return;
    }
    setRoommates([...roommates, newRoommate]);
    setNewRoommate('');
  };

  const handleAddChore = () => {
    if (!title || !dueDate || !assignedTo) {
      alert('Please enter a chore title, due date, and assign it to someone.');
      return;
    }

    const newChore: Chore = {
      id: chores.length + 1,
      title,
      assignedTo,
      dueDate,
      completed: false
    };

    setChores([...chores, newChore]);
    setTitle('');
    setDueDate('');
    setAssignedTo('');
  };

  const markCompleted = (id: number) => {
    setChores(chores.map((chore) => (chore.id === id ? { ...chore, completed: true } : chore)));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-black text-white rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Chore Management</h1>
      <div className="mb-6 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Add Roommate</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Roommate Name"
            value={newRoommate}
            onChange={(e) => setNewRoommate(e.target.value)}
            className="w-full p-2 rounded-md text-black border border-gray-600 focus:ring focus:ring-blue-500"
          />
          <button
            onClick={handleAddRoommate}
            className="bg-green-500 hover:bg-green-600 transition p-2 rounded-md font-bold"
          >
            Add
          </button>
        </div>
      </div>
      <div className="mb-6 p-4 text-black rounded-lg">
        <h2 className="text-xl text-white font-semibold mb-3">Add Chore</h2>
        <input
          type="text"
          placeholder="Chore Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border border-gray-600 focus:ring focus:ring-blue-500"
        />
        <input
          type="date"
          placeholder="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border border-gray-600 focus:ring focus:ring-blue-500"
        />
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border border-gray-600 focus:ring focus:ring-blue-500"
        >
          <option value="">Assign to...</option>
          {roommates.map((roommate, index) => (
            <option key={index} value={roommate}>
              {roommate}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddChore}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white transition p-2 rounded-md font-bold"
        >
          Add Chore
        </button>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-3">Chore List</h2>
        {chores.length === 0 ? (
          <p className="text-gray-400">No chores assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chores.map((chore) => (
              <div
                key={chore.id}
                className={`p-4 bg-gray-800 rounded-lg shadow-md ${
                  chore.completed ? 'opacity-50' : ''
                }`}
              >
                <h3 className="text-lg font-bold">{chore.title}</h3>
                <p className="text-sm text-gray-400">Assigned To: {chore.assignedTo}</p>
                <p className="text-sm text-gray-400">Due Date: {chore.dueDate}</p>
                <p className={`text-sm ${chore.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {chore.completed ? 'Completed' : 'Pending'}
                </p>

                {!chore.completed && (
                  <button
                    onClick={() => markCompleted(chore.id)}
                    className="mt-2 bg-green-500 hover:bg-green-600 transition p-2 rounded-md font-bold"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chore;
