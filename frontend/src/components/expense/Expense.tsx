'use client';

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface Split {
  user_id: { _id: string; name: string };
  amount: number;
}

interface SplitAmong {
  user: string;
  amount: string;
}

interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: 'rent' | 'utilities' | 'groceries' | 'household' | 'other';
  due_date: string;
  status: 'pending' | 'settled';
  splits: Split[];
  created_by: { _id: string; name: string };
  household_id: string;
  receipt_url: string;
  recurring: { is_recurring: boolean };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Roommate {
  id: string;
  name: string;
}

const Expense = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState<
    'rent' | 'utilities' | 'groceries' | 'household' | 'other'
  >('rent');
  const [dueDate, setDueDate] = useState('');
  const [splitAmong, setSplitAmong] = useState<SplitAmong[]>([]);
  const [splitEvenly, setSplitEvenly] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [roommates, setRoommates] = useState<Roommate[]>([]);

  const fetchRoommates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found, user not logged in.');
      }

      // Fetch user data to get the householdId
      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user details');

      const userData = await userResponse.json();
      const householdId = userData.data?.household_id;

      if (!householdId) throw new Error('User is not associated with any household');

      const householdResponse = await fetch(`http://localhost:5001/api/households/${householdId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!householdResponse.ok) throw new Error('Failed to fetch household data');

      const householdData = await householdResponse.json();

      setRoommates(
        householdData.data.members.map((member: { name: string; _id: string }) => ({
          name: member.name,
          id: member._id
        }))
      );

      console.log('Fetched roommates:', householdData.data.members);
      console.log('Actual roommates:', roommates);

      fetchExpenses(token);
    } catch (error) {
      console.error('Error fetching roommates:', error);
    }
  };

  const fetchExpenses = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/expenses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch expenses');

      const data = await response.json();
      console.log('Fetched expenses:', data); // Debugging
      setExpenses(data.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  useEffect(() => {
    fetchRoommates();
  }, []);

  const handleTotalAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setTotalAmount(numericValue ? Number(numericValue) : '');
    setSplitAmong([]);
  };

  const handleSplitChange = (index: number, field: keyof SplitAmong, value: string) => {
    const updatedSplit = [...splitAmong];

    if (field === 'user') {
      updatedSplit[index][field] = value;
    } else if (field === 'amount') {
      updatedSplit[index][field] = value;
    }

    setSplitAmong(updatedSplit);
  };

  const addSplitField = () => {
    if (!totalAmount || totalAmount <= 0) {
      setErrorMessage('Enter total amount first!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setSplitAmong([...splitAmong, { user: '', amount: '' }]);
  };

  const removeSplitField = (index: number) => {
    if (splitAmong.length > 1) {
      setSplitAmong(splitAmong.filter((_, i) => i !== index));
    }
  };

  const toggleSplitMethod = () => {
    setSplitEvenly(!splitEvenly);
    setErrorMessage('');
  };

  useEffect(() => {
    if (splitEvenly && totalAmount && splitAmong.length > 0) {
      const evenAmount = (Number(totalAmount) / splitAmong.length).toFixed(2);
      setSplitAmong((prevSplits) => prevSplits.map((entry) => ({ ...entry, amount: evenAmount })));
    }
  }, [totalAmount, splitAmong.length, splitEvenly]);

  const validateExpense = () => {
    if (
      !title ||
      !description ||
      totalAmount === '' ||
      !paidBy ||
      splitAmong.length === 0 ||
      !category ||
      !dueDate
    ) {
      setErrorMessage('Please fill in all fields.');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    const sumOfAmounts = splitAmong.reduce((sum, entry) => sum + Number(entry.amount), 0);

    if (!splitEvenly && sumOfAmounts !== Number(totalAmount)) {
      setErrorMessage('Error: Split amounts must add up to the total amount.');
      setTimeout(() => setErrorMessage(''), 3000);
      return false;
    }

    setErrorMessage('');
    return true;
  };

  // const handleMarkAsPaid = (expenseId: number) => {
  //   setExpenses(
  //     expenses.map((expense) =>
  //       expense.id === expenseId ? { ...expense, status: 'settled' } : expense
  //     )
  //   );
  // };

  const handleAddExpense = async () => {
    if (!validateExpense()) return;

    const newExpense = {
      title,
      amount: Number(totalAmount),
      category,
      description,
      due_date: dueDate,
      splits: splitAmong.map((entry) => {
        const roommate = roommates.find((roommate) => roommate.id === entry.user);
        if (!roommate) {
          throw new Error(`Roommate with id ${entry.user} not found.`);
        }
        return {
          user_id: roommate.id,
          amount: Number(entry.amount)
        };
      }),
      recurring: null,
      receipt_url: ''
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found, user not logged in.');
      }

      console.log('Sending expense data:', newExpense);

      const response = await fetch('http://localhost:5001/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newExpense)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error adding expense:', errorData);
        throw new Error(errorData.message || 'Failed to add expense');
      }

      const createdExpense = await response.json();
      setExpenses([...expenses, createdExpense.data]);

      setTitle('');
      setDescription('');
      setTotalAmount('');
      setPaidBy('');
      setCategory('rent');
      setDueDate('');
      setSplitAmong([]);
    } catch (error) {
      console.error('Error adding expense:', error);
      setErrorMessage('Failed to add expense. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-black text-white rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Expense Tracker</h1>

      <div className="mb-6 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Add Expense</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Total Amount"
          value={totalAmount.toString()}
          onChange={(e) => handleTotalAmountChange(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        />

        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        >
          <option value="">Select Paid By</option>
          {roommates.map((roommate, i) => (
            <option key={i} value={roommate.id}>
              {roommate.name}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value as 'rent' | 'utilities' | 'groceries' | 'household' | 'other'
            )
          }
          className="w-full p-2 mb-4 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        >
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="groceries">Groceries</option>
          <option value="household">Household</option>
          <option value="other">Other</option>
        </select>

        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={splitEvenly}
              onChange={toggleSplitMethod}
              className="w-4 h-4 text-blue-500"
            />
            <span>Split Evenly</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!splitEvenly}
              onChange={toggleSplitMethod}
              className="w-4 h-4 text-blue-500"
            />
            <span>Manual Split</span>
          </label>
        </div>

        {errorMessage && <p className="text-red-500 text-sm font-bold mb-2">{errorMessage}</p>}

        <h3 className="text-lg font-semibold mt-4">Split Among:</h3>
        {splitAmong.map((entry, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <select
              value={entry.user}
              onChange={(e) => handleSplitChange(index, 'user', e.target.value)}
              className="w-1/3 p-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
            >
              <option value="">Select User</option>
              {roommates.map((roommate, i) => (
                <option key={i} value={roommate.id}>
                  {roommate.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Amount"
              value={entry.amount}
              onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
              className="w-1/3 p-2 rounded-md text-black border border-gray-600 focus:ring focus:ring-blue-500"
              disabled={splitEvenly}
            />
            <button
              onClick={() => removeSplitField(index)}
              className="bg-red-500 text-white p-2 rounded-md"
            >
              ✖
            </button>
          </div>
        ))}

        <button
          onClick={addSplitField}
          className="w-full mt-2 bg-gray-600 hover:bg-gray-700 transition p-2 rounded-md font-semibold"
        >
          + Add User
        </button>

        <button
          onClick={handleAddExpense}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 transition p-2 rounded-md font-bold"
        >
          Submit Expense
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Expenses</h2>
        <div className="space-y-4 mt-4">
          {expenses && expenses.length > 0 ? (
            expenses.map((expense) => (
              <div
                key={expense._id}
                className="p-4 border rounded-lg border-gray-800 bg-white text-black"
              >
                <h3 className="text-xl font-bold">{expense.title}</h3>
                <p>{expense.description}</p>
                <p className="text-lg font-semibold">Total: ${expense.amount}</p>
                <p>Status: {expense.status}</p>
                <p>Category: {expense.category}</p>
                <p>Due Date: {new Date(expense.due_date).toLocaleDateString()}</p>
                <div className="mt-2">
                  <h4 className="font-semibold">Split Among:</h4>
                  {expense.splits.map((split, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{split.user_id.name}</span> <span>${split.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No expenses found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expense;
