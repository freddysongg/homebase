'use client';

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import ExpenseChart from './ExpenseChart';
import ChoreChart from './ChoreChart';

interface Chore {
  _id: string;
  name: string;
  description?: string;
  assigned_to: { _id: string; name: string }[];
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  due_date: string;
  status: 'pending' | 'paid';
  created_by: { name: string };
}

interface Member {
  _id: string;
  name: string;
  lastActive?: Date;
}

interface Household {
  _id: string;
  name: string;
  members: Member[];
}

const Dashboard = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'chores'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      // Fetch user's household
      const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');

      const userData = await userResponse.json();
      const householdId = userData.data.household_id;

      if (!householdId) {
        setLoading(false);
        return;
      }

      // Fetch household details
      const householdResponse = await fetch(`http://localhost:5001/api/households/${householdId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!householdResponse.ok) throw new Error('Failed to fetch household data');

      const householdData = await householdResponse.json();
      setHousehold(householdData.data);

      // Fetch chores
      const choresResponse = await fetch('http://localhost:5001/api/chores', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!choresResponse.ok) throw new Error('Failed to fetch chores');

      const choresData = await choresResponse.json();
      setChores(choresData.data);

      // Fetch expenses
      const expensesResponse = await fetch('http://localhost:5001/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!expensesResponse.ok) throw new Error('Failed to fetch expenses');

      const expensesData = await expensesResponse.json();
      setExpenses(expensesData.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (!household) {
    return (
      <div className="text-center p-4">
        Please join or create a household to view the dashboard.
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses
    .filter((expense) => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {household.name} Dashboard
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'expenses'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('chores')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'chores'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Chores
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalExpenses.toFixed(2)}
              </p>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Pending: ${pendingExpenses.toFixed(2)}
              </div>
            </div>
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Chores
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {chores.filter((chore) => chore.status !== 'completed').length}
              </p>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Total: {chores.length}
              </div>
            </div>
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Household Members
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {household.members.length}
              </p>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Active Today:{' '}
                {
                  household.members.filter(
                    (m) =>
                      m.lastActive &&
                      new Date(m.lastActive).toDateString() === new Date().toDateString()
                  ).length
                }
              </div>
            </div>
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completion Rate
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {chores.length > 0
                  ? `${((chores.filter((c) => c.status === 'completed').length / chores.length) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Last 7 days</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Expenses
              </h2>
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{expense.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {expense.created_by.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">${expense.amount}</p>
                      <p
                        className={`text-sm ${
                          expense.status === 'paid' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {expense.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Upcoming Chores
              </h2>
              <div className="space-y-4">
                {chores
                  .filter((chore) => chore.status !== 'completed')
                  .slice(0, 5)
                  .map((chore) => (
                    <div key={chore._id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{chore.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {chore.assigned_to.map((user) => user.name).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(chore.due_date).toLocaleDateString()}
                        </p>
                        <p
                          className={`text-sm ${
                            chore.status === 'completed'
                              ? 'text-green-500'
                              : chore.status === 'in-progress'
                                ? 'text-blue-500'
                                : 'text-yellow-500'
                          }`}
                        >
                          {chore.status}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <ExpenseChart expenses={expenses} />
        </div>
      )}

      {activeTab === 'chores' && (
        <div className="space-y-6">
          <ChoreChart chores={chores} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
