import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, LogOut, Menu, Check, Bell, Lock as LockIcon, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { Select } from '../ui/Select';
import { Avatar } from '../ui/Avatar';
import { cn } from '@/lib/utils';
import { INotification } from '@/types';
import { formatTimeAgo } from '@/utils/formatters';
interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const { currentUniversity, universities, setCurrentUniversity } = useTenantStore();
  const { theme, toggleTheme } = useThemeStore();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isAdmin = user?.role === 'universityAdmin' || user?.role === 'collegeAdmin';

  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Mock notifications - in real app, fetch from API
  const [notifications] = useState<INotification[]>([
    {
      id: '1',
      title: 'New Assignment Posted',
      message: 'A new assignment has been posted for CS101 - Introduction to Programming',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      link: '/dashboard/assessments/my-assessments',
    },
    {
      id: '2',
      title: 'Grade Updated',
      message: 'Your grade for Midterm Exam in CS201 has been updated',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      link: '/dashboard/enrollments',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const canSwitchTenant = user?.role === 'superAdmin' || user?.role === 'admin';

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showLanguageDropdown || showNotificationsDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown, showNotificationsDropdown, showUserDropdown]);

  const handleTenantChange = (universityId: string) => {
    const university = universities.find(u => u.id === universityId);
    if (university) {
      setCurrentUniversity(university);
    }
  };

  const handleLockScreen = () => {
    setShowUserDropdown(false);
    navigate('/lock');
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 shadow-sm dark:shadow-slate-950/30 px-4 py-3 lg:px-6 h-16 flex items-center transition-colors duration-300">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex p-2 text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-accent-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {currentUniversity && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200/70 dark:border-slate-700">
              {currentUniversity.logoUrl && (
                <img
                  src={currentUniversity.logoUrl}
                  alt={currentUniversity.name}
                  className="h-8 w-8 rounded-full ring-2 ring-accent-200 dark:ring-accent-500/40"
                />
              )}
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                {currentUniversity.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden',
              'text-slate-600 hover:text-primary-700 hover:bg-primary-50',
              'dark:text-slate-300 dark:hover:text-accent-400 dark:hover:bg-slate-800'
            )}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Sun className={cn(
              'h-5 w-5 transition-all duration-300',
              theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
            )} />
            <Moon className={cn(
              'h-5 w-5 absolute transition-all duration-300 text-accent-400',
              theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
            )} />
          </button>

          {/* Notifications */}
          <div 
            ref={notificationsDropdownRef}
            className="relative"
          >
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className={cn(
                'relative flex items-center justify-center p-2 rounded-lg transition-all duration-200',
                'text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-accent-400 hover:bg-primary-50 dark:hover:bg-slate-800',
                showNotificationsDropdown && 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-accent-400'
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex items-center justify-center h-4 min-w-[1rem] px-1 bg-gradient-to-br from-accent-500 to-accent-600 text-primary-900 text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsDropdown && (
              <div className={cn(
                'absolute top-full mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50',
                'animate-fade-in w-80 max-h-96 overflow-hidden flex flex-col right-0'
              )}>
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {isAdmin ? 'Critical System Notifications' : 'Notifications'}
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">{unreadCount} unread</span>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-64">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {notifications.slice(0, 2).map((notification) => (
                        <Link
                          key={notification.id}
                          to={notification.link || '#'}
                          onClick={() => setShowNotificationsDropdown(false)}
                          className={cn(
                            'block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-b-0',
                            !notification.read && 'bg-blue-50/50 dark:bg-primary-900/20'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'flex-shrink-0 w-2 h-2 rounded-full mt-2',
                              notification.type === 'info' && 'bg-blue-500',
                              notification.type === 'success' && 'bg-green-500',
                              notification.type === 'warning' && 'bg-yellow-500',
                              notification.type === 'error' && 'bg-red-500'
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm font-medium text-gray-900 dark:text-slate-100 mb-1',
                                !notification.read && 'font-semibold'
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-slate-500">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer - See More Button */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60">
                    <Link
                      to="/dashboard/notifications"
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="block w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors"
                    >
                      See all notifications
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div 
            ref={languageDropdownRef}
            className="relative"
          >
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200',
                'text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-accent-400 hover:bg-primary-50 dark:hover:bg-slate-800',
                showLanguageDropdown && 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-accent-400'
              )}
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {languages.find(lang => lang.code === i18n.language)?.code.toUpperCase() || 'EN'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showLanguageDropdown && (
              <div className={cn(
                'absolute top-full mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-2 min-w-[160px] z-50',
                'animate-fade-in right-0'
              )}>
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                      'text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800',
                      i18n.language === language.code && 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-accent-400 font-medium'
                    )}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="flex-1 text-left">
                      {language.label}
                    </span>
                    {i18n.language === language.code && (
                      <Check className="h-4 w-4 text-primary-600 dark:text-accent-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tenant Switcher (for admins) */}
          {canSwitchTenant && universities.length > 0 && (
            <Select
              value={currentUniversity?.id || ''}
              onChange={(e) => handleTenantChange(e.target.value)}
              options={universities.map(u => ({
                value: u.id,
                label: u.name,
              }))}
              className="w-48"
            />
          )}

          {/* User Profile Dropdown */}
          {user && (
            <div 
              ref={userDropdownRef}
              className="relative"
            >
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={cn(
                  'flex items-center gap-2 p-1 rounded-full transition-all duration-200 ring-2',
                  showUserDropdown ? 'ring-accent-400 bg-primary-50 dark:bg-slate-800' : 'ring-transparent hover:ring-accent-300 dark:hover:ring-accent-500/60'
                )}
                aria-label="User menu"
              >
                <Avatar
                  src={user.avatarUrl}
                  name={user.name}
                  size="sm"
                />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className={cn(
                  'absolute top-full mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 py-2 min-w-[220px] z-50',
                  'animate-fade-in right-0'
                )}>
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={handleLockScreen}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200"
                    >
                      <LockIcon className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      <span className="flex-1 text-left">
                        Lock Screen
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="flex-1 text-left">
                        {t('common.logout') || 'Logout'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

