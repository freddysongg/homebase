'use client';

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '@/components/ThemeProvider';
import { notificationService } from '@/utils/notificationService';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  preferences: {
    notifications: {
      inApp: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
}

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    notifications: {
      inApp: true
    },
    theme: 'system' as 'light' | 'dark' | 'system'
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Sync theme with ThemeProvider
  useEffect(() => {
    setTheme(preferences.theme);
  }, [preferences.theme, setTheme]);

  // Sync notification preferences with notification service
  useEffect(() => {
    notificationService.setPreferences(preferences.notifications);
  }, [preferences.notifications]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      const userProfile = userData.data;

      setProfile(userProfile);
      setName(userProfile.name);
      setEmail(userProfile.email);
      setPreferences(
        userProfile.preferences || {
          notifications: {
            inApp: true
          },
          theme: 'system'
        }
      );
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile. Please try again.');
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token || !profile?._id) {
        throw new Error('Token or user ID not found. Please log in again.');
      }

      const response = await fetch(`http://localhost:5001/api/users/${profile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          preferences
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile.data);
      setSuccessMessage('Profile updated successfully!');
      location.reload();

      // Only show in-app notification for settings update
      if (preferences.notifications.inApp) {
        notificationService.sendNotification(
          'inApp',
          'Settings Updated',
          'Your settings have been saved successfully'
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const err = error as Error;
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-dark-primary text-gray-900 dark:text-white rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold mb-6 text-center">User Settings</h1>

      {successMessage && (
        <div className="mb-4 p-2 bg-green-500 text-white rounded">{successMessage}</div>
      )}
      {error && <div className="mb-4 p-2 bg-red-500 text-white rounded">{error}</div>}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded-md border bg-white dark:bg-dark-secondary text-gray-900 dark:text-white border-gray-300 dark:border-dark-border focus:ring focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-md border bg-white dark:bg-dark-secondary text-gray-900 dark:text-white border-gray-300 dark:border-dark-border focus:ring focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.notifications.inApp}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notifications: {
                      inApp: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 text-blue-500 dark:text-blue-400"
              />
              <span>Show In-App Notifications</span>
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={preferences.theme === 'light'}
                onChange={() => setPreferences({ ...preferences, theme: 'light' })}
                className="w-4 h-4 text-blue-500 dark:text-blue-400"
              />
              <span>Light</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={preferences.theme === 'dark'}
                onChange={() => setPreferences({ ...preferences, theme: 'dark' })}
                className="w-4 h-4 text-blue-500 dark:text-blue-400"
              />
              <span>Dark</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={preferences.theme === 'system'}
                onChange={() => setPreferences({ ...preferences, theme: 'system' })}
                className="w-4 h-4 text-blue-500 dark:text-blue-400"
              />
              <span>System</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={isLoading}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition p-2 rounded-md font-bold disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          {isLoading ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
