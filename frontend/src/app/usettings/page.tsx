'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Settings from '@/components/usettings/Settings';

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
      <Settings />
    </div>
  );
}
