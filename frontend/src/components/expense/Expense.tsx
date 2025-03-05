'use client';

import React, { useState, useEffect } from 'react';

interface SplitAmong {
  user: string;
  amount: string;
}

interface Expense {
  id: number;
  description: string;
  totalAmount: number;
  paidBy: string;
  splitAmong: SplitAmong[];
  status: 'pending' | 'settled';
}

const Expense: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [paidBy, setPaidBy] = useState('');
  const [splitAmong, setSplitAmong] = useState<SplitAmong[]>([]);
  const [splitEvenly, setSplitEvenly] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [roommates, setRoommates] = useState<string[]>([]);

  const fetchRoommates = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/house');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setRoommates(data.map((roommate: { name: string }) => roommate.name));
    } catch (error) {
      console.error('Error fetching roommates:', error);
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
      const numericValue = value.replace(/[^0-9.]/g, '');
      updatedSplit[index][field] = numericValue;
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

    if (!splitEvenly && totalAmount && splitAmong.length > 0) {
      const evenAmount = (Number(totalAmount) / splitAmong.length).toFixed(2);
      setSplitAmong(splitAmong.map((entry) => ({ ...entry, amount: evenAmount })));
    }
  };

  const validateExpense = () => {
    if (!description || totalAmount === '' || !paidBy || splitAmong.length === 0) {
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

  const handleMarkAsPaid = (expenseId: number) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === expenseId ? { ...expense, status: 'settled' } : expense
      )
    );
  };

  const handleMarkAllAsPaid = () => {
    setExpenses(expenses.map((expense) => ({ ...expense, status: 'settled' })));
  };

  const handleAddExpense = () => {
    if (!validateExpense()) return;

    const newExpense: Expense = {
      id: expenses.length + 1,
      description,
      totalAmount: Number(totalAmount),
      paidBy,
      splitAmong: splitAmong.map((entry) => ({ ...entry, amount: Number(entry.amount) })),
      status: 'pending'
    };

    setExpenses([...expenses, newExpense]);
    setDescription('');
    setTotalAmount('');
    setPaidBy('');
    setSplitAmong([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-black text-white rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Expense Tracker</h1>

      <div className="mb-6 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Add Expense</h2>
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

        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full p-2 mb-4 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        >
          <option value="">Select Paid By</option>
          {roommates.map((roommate, i) => (
            <option key={i} value={roommate}>
              {roommate}
            </option>
          ))}
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
                <option key={i} value={roommate}>
                  {roommate}
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
      <div>
        <h2 className="text-2xl font-bold mb-3">Expenses</h2>

        {expenses.length > 0 && (
          <button
            onClick={handleMarkAllAsPaid}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Mark All as Paid
          </button>
        )}

        {expenses.length === 0 ? (
          <p className="text-gray-400">No expenses recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-lg font-bold">{expense.description}</h3>

                {expense.splitAmong.map((split, i) => (
                  <p key={i} className="text-sm text-gray-400">
                    {split.user} pays: ${split.amount.toFixed(2)}
                  </p>
                ))}

                <p className="text-sm text-gray-400">Paid By: {expense.paidBy}</p>
                <p
                  className={`text-sm ${expense.status === 'settled' ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  Status: {expense.status}
                </p>

                {expense.status === 'pending' && (
                  <button
                    onClick={() => handleMarkAsPaid(expense.id)}
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                  >
                    Mark as Paid
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

export default Expense;
