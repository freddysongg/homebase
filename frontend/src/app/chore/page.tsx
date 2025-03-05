'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Chore from '@/components/chore/Chore';

export default function ChorePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div>
      <Chore />
    </div>
  );
}
