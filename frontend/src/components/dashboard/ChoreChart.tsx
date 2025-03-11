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
  const statusCounts = chores.reduce((acc, chore) => {
    acc[chore.status] = (acc[chore.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate completion rate over time (last 7 days)
  const completionTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayChores = chores.filter(chore => {
      const choreDate = new Date(chore.due_date);
      choreDate.setHours(0, 0, 0, 0);
      return choreDate.getTime() === date.getTime();
    });

    const completed = dayChores.filter(chore => chore.status === 'completed').length;
    const total = dayChores.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      date: date.toLocaleDateString('default', { weekday: 'short' }),
      rate: completionRate
    };
  }).reverse();

  // Calculate workload distribution (only for active chores)
  const memberWorkload = chores
    .filter(chore => chore.status !== 'completed')
    .reduce((acc, chore) => {
      chore.assigned_to.forEach(member => {
        acc[member.name] = (acc[member.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

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
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const trendData = {
    labels: completionTrend.map(item => item.date),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: completionTrend.map(item => item.rate),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
        },
      },
      title: {
        display: true,
        text: 'Chore Status Distribution',
        color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
        },
      },
      title: {
        display: true,
        text: 'Daily Completion Rate',
        color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
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
      <div className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Member Workload</h3>
        {Object.keys(memberWorkload).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(memberWorkload).map(([member, count]) => (
              <div key={member} className="flex items-center">
                <div className="w-32 text-sm text-gray-600 dark:text-gray-300">{member}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 dark:bg-blue-600"
                      style={{
                        width: `${(count / Math.max(...Object.values(memberWorkload))) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm text-gray-600 dark:text-gray-300">
                  {count}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No active chores assigned</p>
        )}
      </div>
    </div>
  );
};

export default ChoreChart;