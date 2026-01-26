'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const NO_SIDEBAR_ROUTES = ['/login', '/onboarding'];

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hideSidebar = NO_SIDEBAR_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (hideSidebar) return;

    // Initialize from localStorage
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }

    // Listen for sidebar toggle events
    const handleSidebarToggle = (event: CustomEvent<{ collapsed: boolean }>) => {
      setIsCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, [hideSidebar]);

  if (hideSidebar) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300 ease-out",
          "ml-0",
          isCollapsed ? "lg:ml-20" : "lg:ml-56"
        )}
      >
        {children}
      </main>
    </div>
  );
}
