'use client';

/**
 * Root page - redirects to the dashboard.
 * The dashboard is the main page of the application.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-500 text-lg">Loading dashboard...</div>
    </div>
  );
}
