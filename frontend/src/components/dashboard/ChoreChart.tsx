'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

interface Chore {
  _id: string;
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
  assigned_to: { _id: string; name: string }[];
}

interface ChoreChartProps {
  chores: Chore[];
}

const ChoreChart: React.FC<ChoreChartProps> = ({ chores }) => {
  // Calculate status distribution
  const statusCounts = chores.reduce(
    (acc, chore) => {
      acc[chore.status] = (acc[chore.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate completion rate over time (last 7 days)
  const completionTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Get all chores due on or before this date
    const relevantChores = chores.filter((chore) => {
      const choreDate = new Date(chore.due_date);
      choreDate.setHours(0, 0, 0, 0);
      return choreDate.getTime() <= date.getTime();
    });

    const completed = relevantChores.filter((chore) => chore.status === 'completed').length;
    const total = relevantChores.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      date: date.toLocaleDateString('default', { weekday: 'short' }),
      rate: completionRate
    };
  }).reverse();

  const statusData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [
          statusCounts['pending'] || 0,
          statusCounts['in-progress'] || 0,
          statusCounts['completed'] || 0
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: ['rgba(255, 206, 86, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1
      }
    ]
  };

  const trendData = {
    labels: completionTrend.map((item) => item.date),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: completionTrend.map((item) => item.rate),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
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
        text: 'Chore Status Distribution',
        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
      }
    }
  };

  const lineOptions = {
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
        text: 'Daily Completion Rate',
        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow">
          <Doughnut data={statusData} options={options} />
        </div>
        <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow">
          <Line data={trendData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
};

export default ChoreChart;
