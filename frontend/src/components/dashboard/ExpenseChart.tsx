'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface Expense {
  _id: string;
  amount: number;
  category: string;
  due_date: string;
  status: 'pending' | 'paid';
}

interface ExpenseChartProps {
  expenses: Expense[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  // Group expenses by category and calculate totals
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate monthly trends (last 6 months)
  const monthlyTotals = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const total = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.due_date);
        return (
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    return { month: `${month} ${year}`, total };
  }).reverse();

  const data = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(expensesByCategory),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
        }
      },
      title: {
        display: true,
        text: 'Expenses by Category',
        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
        },
        grid: {
          color: document.documentElement.classList.contains('dark')
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
        },
        grid: {
          color: document.documentElement.classList.contains('dark')
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const trendData = {
    labels: monthlyTotals.map((item) => item.month),
    datasets: [
      {
        label: 'Monthly Expense Trend',
        data: monthlyTotals.map((item) => item.total),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      }
    ]
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow">
        <Bar data={data} options={options} />
      </div>
      <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow">
        <Bar
          data={trendData}
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              title: {
                ...options.plugins.title,
                text: 'Monthly Expense Trends'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default ExpenseChart;
