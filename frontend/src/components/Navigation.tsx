'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); 
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
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
    <nav className="bg-black text-white p-4">
      <div className="max-w-7xl mx-20 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          HomeBase
        </Link>
        <div className="hidden md:flex flex-grow justify-center space-x-16">
          {isLoggedIn && (
            <>
              <Link href="/expense" className="hover:text-blue-400 transition">
                Expenses
              </Link>
              <Link href="/chore" className="hover:text-blue-400 transition">
                Chores
              </Link>
              <Link href="/tasks" className="hover:text-blue-400 transition">
                Tasks
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
                User ▼
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
