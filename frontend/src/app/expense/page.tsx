'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Expense from '@/components/Expense';

export default function ExpensePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div>
      <Expense />
    </div>
  );
}
