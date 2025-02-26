'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Tasks from '@/components/Tasks';

export default function TasksPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div>
      <Tasks />
    </div>
  );
}
