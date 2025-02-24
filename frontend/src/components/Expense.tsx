'use client';

import React, { useState } from 'react';

interface SplitAmong {
  user: string;
  amount: number;
}

interface Expense {
  id: number;
  description: string;
  totalAmount: number;
  paidBy: string;
  splitAmong: { user: string; amount: number }[];
  status: 'pending' | 'settled';
}

const Expense: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [paidBy, setPaidBy] = useState('');
  const [splitAmong, setSplitAmong] = useState([{ user: '', amount: 0 }]);

  const handleAddExpense = () => {
    if (!description || totalAmount === '' || !paidBy || splitAmong.length === 0) {
      alert('Please fill in all fields.');
      return;
    }

    const newExpense: Expense = {
      id: expenses.length + 1,
      description,
      totalAmount: Number(totalAmount),
      paidBy,
      splitAmong,
      status: 'pending'
    };

    setExpenses([...expenses, newExpense]);
    setDescription('');
    setTotalAmount('');
    setPaidBy('');
    setSplitAmong([{ user: '', amount: 0 }]);
  };

const handleSplitChange = (index: number, field: keyof SplitAmong, value: string | number) => {
  const updatedSplit = [...splitAmong];

  if (field === 'user') {
    updatedSplit[index][field] = value as string;
  } else if (field === 'amount') {
    updatedSplit[index][field] = Number(value); 
  }

  setSplitAmong(updatedSplit);
};

  const addSplitField = () => {
    setSplitAmong([...splitAmong, { user: '', amount: 0 }]);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-black text-white rounded-lg shadow-lg mt-8">
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
          type="number"
          placeholder="Total Amount"
          value={totalAmount}
          onChange={(e) => setTotalAmount(Number(e.target.value))}
          className="w-full p-2 mb-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full p-2 mb-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
        />
        <h3 className="text-lg font-semibold mt-4">Split Among:</h3>
        {splitAmong.map((entry, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="User"
              value={entry.user}
              onChange={(e) => handleSplitChange(index, 'user', e.target.value)}
              className="w-1/2 p-2 rounded-md border text-black border-gray-600 focus:ring focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={entry.amount}
              onChange={(e) => handleSplitChange(index, 'amount', Number(e.target.value))}
              className="w-1/2 p-2 rounded-md text-black border border-gray-600 focus:ring focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          onClick={addSplitField}
          className="w-full mt-2 bg-gray-600 hover:bg-gray-700 transition p-2 rounded-md font-semibold"
        >
          + Add More Users
        </button>

        <button
          onClick={handleAddExpense}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 transition p-2 rounded-md font-bold"
        >
          Add Expense
        </button>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-3">Expenses</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-400">No expenses recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-lg font-bold">{expense.description}</h3>
                <p className="text-sm text-gray-400">Total: ${expense.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Paid By: {expense.paidBy}</p>
                <p
                  className={`text-sm ${expense.status === 'settled' ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  Status: {expense.status}
                </p>
                <div className="mt-2">
                  <h4 className="text-sm font-semibold">Split Among:</h4>
                  {expense.splitAmong.map((split, i) => (
                    <p key={i} className="text-xs text-gray-300">
                      {split.user}: ${split.amount.toFixed(2)}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;
