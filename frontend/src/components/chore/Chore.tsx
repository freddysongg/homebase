'use client';

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface ChoreType {
  _id: string;
  name: string;
  description?: string;
  assigned_to: string[];
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed';
  household_id: string;
  rotation: boolean;
  recurring: {
    is_recurring: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | null;
    end_date: string | null;
  };
}

interface User {
  _id: string;
  name: string;
}

const Chore: React.FC = () => {
  const [chores, setChores] = useState<ChoreType[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [isRotation, setIsRotation] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [recurringEndDate, setRecurringEndDate] = useState<string>('');
  const [householdMembers, setHouseholdMembers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserHousehold();
  }, []);

  useEffect(() => {
    if (householdId) {
      fetchChores();
      fetchHouseholdMembers();
    }
  }, [householdId]);

  const fetchUserHousehold = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await userResponse.json();
      if (!userData.data.household_id) {
        throw new Error('User is not part of a household');
      }

      setHouseholdId(userData.data.household_id);
    } catch (error) {
      console.error('Error fetching user household:', error);
      setError('Failed to fetch user household. Please try again.');
    }
  };

  const fetchChores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      const response = await fetch('http://localhost:5001/api/chores', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chores');
      }

      const data = await response.json();
      setChores(data.data);
    } catch (error) {
      console.error('Error fetching chores:', error);
      setError('Failed to fetch chores. Please try again.');
    }
  };

  const fetchHouseholdMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !householdId) {
        throw new Error('Token or household ID not found.');
      }

      const householdResponse = await fetch(`http://localhost:5001/api/households/${householdId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!householdResponse.ok) {
        throw new Error('Failed to fetch household details');
      }

      const householdData = await householdResponse.json();
      setHouseholdMembers(householdData.data.members);
    } catch (error) {
      console.error('Error fetching household members:', error);
      setError('Failed to fetch household members. Please try again.');
    }
  };

  const handleAddChore = async () => {
    if (!title || !dueDate || assignedTo.length === 0) {
      setError('Please enter a chore title, due date, and assign it to someone.');
      return;
    }

    // Validate that due date is in the future
    const selectedDate = new Date(dueDate);
    if (selectedDate <= new Date()) {
      setError('Due date must be in the future.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token || !householdId) {
        throw new Error('Token or household ID not found. Please log in again.');
      }

      const response = await fetch('http://localhost:5001/api/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: title,
          description: description,
          assigned_to: assignedTo,
          due_date: dueDate,
          status: 'pending',
          household_id: householdId,
          rotation: isRotation,
          recurring: {
            is_recurring: isRecurring,
            frequency: isRecurring ? recurringFrequency : null,
            end_date: isRecurring ? recurringEndDate : null
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create chore');
      }

      const data = await response.json();
      setChores([...chores, data.data]);
      setSuccessMessage('Chore created successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo([]);
    } catch (error) {
      console.error('Error creating chore:', error);
      const err = error as Error;
      setError(err.message || 'Failed to create chore. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const markCompleted = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      const response = await fetch(`http://localhost:5001/api/chores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'completed'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update chore');
      }

      const data = await response.json();
      setChores(chores.map((chore) => (chore._id === id ? data.data : chore)));
      setSuccessMessage('Chore marked as completed!');
    } catch (error) {
      console.error('Error updating chore:', error);
      const err = error as Error;
      setError(err.message || 'Failed to update chore. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-black text-white rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Chore Management</h1>

      {successMessage && (
        <div className="mb-4 p-2 bg-green-500 text-white rounded">{successMessage}</div>
      )}
      {error && <div className="mb-4 p-2 bg-red-500 text-white rounded">{error}</div>}

      <div className="mb-6 p-4 text-black rounded-lg">
        <h2 className="text-xl text-white font-semibold mb-3">Add Chore</h2>
        <input
          type="text"
          placeholder="Chore Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border border-gray-600 focus:ring focus:ring-blue-500"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border border-gray-600 focus:ring focus:ring-blue-500"
          rows={3}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full p-2 mb-2 rounded-md border border-gray-600 focus:ring focus:ring-blue-500"
        />
        <select
          multiple
          value={assignedTo}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
            setAssignedTo(selectedOptions);
          }}
          className="w-full p-2 mb-2 rounded-md border border-gray-600 focus:ring focus:ring-blue-500"
        >
          {householdMembers.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
        <p className="text-white text-sm mb-4">Hold Ctrl/Cmd to select multiple people</p>

        <div className="space-y-4 mb-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRotation}
                onChange={(e) => setIsRotation(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-white">Enable Rotation</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (!e.target.checked) {
                    setRecurringFrequency(null);
                    setRecurringEndDate('');
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-white">Make Recurring</span>
            </label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <select
                value={recurringFrequency || ''}
                onChange={(e) => setRecurringFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="w-full p-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
              >
                <option value="">Select Frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              <div>
                <label className="block text-sm text-white font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAddChore}
          disabled={isLoading}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white transition p-2 rounded-md font-bold disabled:bg-gray-400"
        >
          {isLoading ? 'Adding Chore...' : 'Add Chore'}
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
                key={chore._id}
                className={`p-4 bg-white text-black rounded-lg shadow-md ${
                  chore.status === 'completed' ? 'opacity-50' : ''
                }`}
              >
                <h3 className="text-lg font-bold">{chore.name}</h3>
                {chore.description && (
                  <p className="text-sm text-gray-600 mt-1">{chore.description}</p>
                )}
                <p className="text-sm">
                  Assigned To:{' '}
                  {householdMembers
                    .filter((member) => chore.assigned_to.includes(member._id))
                    .map((member) => member.name)
                    .join(', ')}
                </p>
                <p className="text-sm">Due Date: {new Date(chore.due_date).toLocaleDateString()}</p>
                {chore.rotation && (
                  <p className="text-sm text-blue-600 font-semibold">
                    Rotation Enabled
                  </p>
                )}
                {chore.recurring?.is_recurring && (
                  <p className="text-sm text-purple-600">
                    <span className="font-semibold">Recurring: </span>
                    {chore.recurring.frequency?.charAt(0).toUpperCase() + chore.recurring.frequency?.slice(1)}
                    {chore.recurring.end_date &&
                      ` until ${new Date(chore.recurring.end_date).toLocaleDateString()}`
                    }
                  </p>
                )}
                <p
                  className={`text-sm ${
                    chore.status === 'completed'
                      ? 'text-green-400'
                      : chore.status === 'in-progress'
                        ? 'text-blue-400'
                        : 'text-yellow-400'
                  }`}
                >
                  Status: {chore.status.charAt(0).toUpperCase() + chore.status.slice(1)}
                </p>

                {chore.status !== 'completed' && (
                  <button
                    onClick={() => markCompleted(chore._id)}
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
