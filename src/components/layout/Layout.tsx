import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { PageTransition } from './PageTransition';
import { cn } from '@/lib/utils';
import { RequiresPasswordChangeGate } from '@/components/auth/RequiresPasswordChangeGate';
import { AuthMeSync } from '@/components/auth/AuthMeSync';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebarExpanded = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleToggleSidebar = () => {
    // On mobile, toggle open/close
    // On desktop, toggle expanded/collapsed
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60 dark:from-dark-bg dark:to-dark-bg transition-colors duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        isExpanded={sidebarExpanded}
        onClose={() => setSidebarOpen(false)}
        onToggleExpand={toggleSidebarExpanded}
      />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarExpanded ? 'lg:ps-64' : 'lg:ps-16'
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Navbar onToggleSidebar={handleToggleSidebar} />
        <AuthMeSync />
        <RealtimeProvider />
        <main className="p-4 sm:p-6 lg:p-8 max-w-content mx-auto">
          <RequiresPasswordChangeGate>
            <PageTransition />
          </RequiresPasswordChangeGate>
        </main>
      </div>
    </div>
  );
}

