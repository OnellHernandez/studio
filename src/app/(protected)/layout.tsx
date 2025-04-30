"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to login page if not authenticated
    }
  }, [user, loading, router]);

  if (loading || !user) {
     // Display a loading state or skeleton while checking auth/redirecting
     return (
       <div className="container mx-auto px-4 py-8 space-y-4">
         <Skeleton className="h-8 w-1/4" />
         <Skeleton className="h-10 w-full" />
         <div className="space-y-2">
           <Skeleton className="h-16 w-full" />
           <Skeleton className="h-16 w-full" />
           <Skeleton className="h-16 w-full" />
         </div>
       </div>
     );
  }

  // Render children if authenticated
  return <>{children}</>;
}
