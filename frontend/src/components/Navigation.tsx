'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          HomeBase
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link href="/expense" className="hover:text-blue-400 transition">
            Expenses
          </Link>
          <Link href="/chore" className="hover:text-blue-400 transition">
            Chores
          </Link>
          <Link href="/task" className="hover:text-blue-400 transition">
            Tasks
          </Link>
          <Link href="/login" className="hover:text-blue-400 transition">
            Login
          </Link>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
          {isOpen ? '✖' : '☰'}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden flex flex-col items-center mt-4 space-y-2">
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
            href="/chore"
            className="hover:text-blue-400 transition"
            onClick={() => setIsOpen(false)}
          >
            Tasks
          </Link>
          <Link
            href="/chore"
            className="hover:text-blue-400 transition"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
