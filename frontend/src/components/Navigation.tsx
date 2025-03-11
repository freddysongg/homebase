'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserDetails = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: { id?: string } = jwtDecode(token);
        console.log('Decoded Token:', decodedToken);

        const userId = decodedToken.id;
        console.log('User ID from token:', userId);

        if (userId) {
          const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('Response:', response);

          const responseText = await response.text();
          console.log('Response Text:', responseText);

          if (response.ok) {
            const result = JSON.parse(responseText);
            console.log('Backend Response:', result);

            if (result.success && result.data) {
              setUserName(result.data.name);
              setIsLoggedIn(true);
            } else {
              console.error('Failed to fetch user details:', result.message);
              setIsLoggedIn(false);
            }
          } else {
            console.error('Failed to fetch user details:', response.statusText);
            setIsLoggedIn(false);
          }
        } else {
          console.error('User ID not found in token');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setIsLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName(null);
    setIsDropdownOpen(false);
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-dark-primary text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-20 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400">
          HomeBase
        </Link>
        <div className="hidden md:flex flex-grow justify-center space-x-16">
          {isLoggedIn && (
            <>
              <Link
                href="/dashboard"
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition ${
                  pathname === '/dashboard' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/homes"
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition ${
                  pathname === '/homes' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Homes
              </Link>
              <Link
                href="/expense"
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition ${
                  pathname === '/expense' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Expenses
              </Link>
              <Link
                href="/chore"
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition ${
                  pathname === '/chore' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Chores
              </Link>
              <Link
                href="/usettings"
                className={`hover:text-blue-600 dark:hover:text-blue-400 transition ${
                  pathname === '/usettings' ? 'text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Settings
              </Link>
            </>
          )}
        </div>
        <div className="hidden md:flex items-center space-x-6">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hover:text-blue-400 transition"
              >
                {userName || 'User'} ▼
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-dark-secondary ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-primary"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hover:text-blue-400 transition">
              Login
            </Link>
          )}
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
          {isOpen ? '✖' : '☰'}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden flex flex-col items-center mt-4 space-y-2">
          {isLoggedIn && (
            <>
              <Link
                href="/expense"
                className="hover:text-blue-400 transition"
                onClick={() => setIsOpen(false)}
              >
                Expenses
              </Link>
              <Link
                href="/chore"
                className="hover:text-blue-400 transition"
                onClick={() => setIsOpen(false)}
              >
                Chores
              </Link>
              <Link
                href="/task"
                className="hover:text-blue-400 transition"
                onClick={() => setIsOpen(false)}
              >
                Tasks
              </Link>
              <button onClick={handleLogout} className="hover:text-blue-400 transition">
                Logout
              </button>
            </>
          )}
          {!isLoggedIn && (
            <Link
              href="/login"
              className="hover:text-blue-400 transition"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
