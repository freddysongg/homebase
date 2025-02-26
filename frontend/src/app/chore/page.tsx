'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Chore from '@/components/Chore';

export default function ChorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  if (status === 'loading') {
    return <p className="text-center text-white mt-20">Loading...</p>;
  }

  if (!session) return null;

  return (
    <div>
      <Chore />
    </div>
  );
}
