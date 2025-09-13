// src/app/(app)/layout.tsx
"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AppSidebar from '@/components/layout/app-sidebar';
import AppTopbar from '@/components/layout/app-topbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { RestaurantProvider } from '@/contexts/restaurant-context';
import type { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton loader for the entire app layout
const AppLayoutSkeleton = () => (
  <div className="flex min-h-screen bg-background">
    {/* Sidebar Skeleton */}
    <div className="hidden md:flex flex-col w-64 border-r p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-2 mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-40" />
          </div>
        ))}
      </div>
      <div className="mt-auto space-y-2">
        <Skeleton className="h-px w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
    {/* Main Content Skeleton */}
    <div className="flex flex-1 flex-col">
      {/* Topbar Skeleton */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Skeleton className="h-6 w-48 md:hidden" />
        <div className="hidden md:block">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-24 hidden md:block" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      {/* Page Content Skeleton */}
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      // Allow access to login page even if this layout is somehow hit
      if (pathname !== '/login') {
        router.replace('/login');
      } else {
        setIsLoading(false); // On login page, no need to load user
      }
    } else {
      setUser(currentUser);
      setIsLoading(false);
    }
  }, [router, pathname]);

  if (isLoading) {
    return <AppLayoutSkeleton />;
  }

  // If still no user and not on login page, means redirect is happening or something is wrong
  if (!user && pathname !== '/login') {
    return <AppLayoutSkeleton />; // Show skeleton while redirecting
  }

  // If on login page, don't render app layout
  if (pathname === '/login' && !user) {
    return <>{children}</>; // Render login page content directly
  }

  // This case should ideally not be hit if redirection logic is correct
  // but as a fallback, if user is null and not on login, show skeleton or redirect.
  if (!user) {
    router.replace('/login');
    return <AppLayoutSkeleton />;
  }

  return (
    <RestaurantProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen bg-background text-foreground">
          <AppSidebar user={user} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <AppTopbar user={user} />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </RestaurantProvider>
  );
}