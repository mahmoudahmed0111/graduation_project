import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

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
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        isExpanded={sidebarExpanded}
        onClose={() => setSidebarOpen(false)}
        onToggleExpand={toggleSidebarExpanded}
      />
      <div 
        className={cn(
          'transition-all duration-300 ease-in-out',
          isRTL
            ? (sidebarExpanded ? 'lg:pr-64' : 'lg:pr-16')
            : (sidebarExpanded ? 'lg:pl-64' : 'lg:pl-16')
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Navbar onToggleSidebar={handleToggleSidebar} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

