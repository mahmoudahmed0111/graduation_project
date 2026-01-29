import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTenantStore } from '@/store/tenantStore';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Globe, LogOut, Menu, Check, Bell, Lock as LockIcon } from 'lucide-react';
import { Select } from '../ui/Select';
import { Avatar } from '../ui/Avatar';
import { cn } from '@/lib/utils';
import { INotification } from '@/types';
import { formatTimeAgo } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const { currentUniversity, universities, setCurrentUniversity } = useTenantStore();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';

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
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
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
    <nav className="bg-white px-4 py-4 lg:px-6 h-16 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {currentUniversity && (
            <div className="hidden md:flex items-center gap-2">
              {currentUniversity.logoUrl && (
                <img
                  src={currentUniversity.logoUrl}
                  alt={currentUniversity.name}
                  className="h-8 w-8"
                />
              )}
              <span className="font-medium text-gray-900">
                {currentUniversity.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div 
            ref={notificationsDropdownRef}
            className="relative"
          >
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className={cn(
                'relative flex items-center justify-center p-2 rounded-lg transition-all duration-200',
                'hover:bg-gray-100',
                showNotificationsDropdown && 'bg-gray-50'
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsDropdown && (
              <div className={cn(
                'absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50',
                'animate-fade-in w-80 max-h-96 overflow-hidden flex flex-col',
                isRTL ? 'left-0' : 'right-0'
              )}>
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-gray-500">{unreadCount} unread</span>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-64">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
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
                            'block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
                            !notification.read && 'bg-blue-50/50'
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
                                'text-sm font-medium text-gray-900 mb-1',
                                !notification.read && 'font-semibold'
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400">
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
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <Link
                      to="/dashboard/notifications"
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="block w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
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
                'hover:bg-gray-100 border-r border-gray-200 pr-3',
                showLanguageDropdown && 'bg-gray-50'
              )}
            >
              <Globe className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {languages.find(lang => lang.code === i18n.language)?.code.toUpperCase() || 'EN'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showLanguageDropdown && (
              <div className={cn(
                'absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] z-50',
                'animate-fade-in',
                isRTL ? 'left-0' : 'right-0'
              )}>
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                      'hover:bg-gray-50',
                      i18n.language === language.code && 'bg-primary-50 text-primary-700 font-medium',
                      isRTL ? 'flex-row-reverse' : ''
                    )}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className={cn('flex-1', isRTL ? 'text-right' : 'text-left')}>
                      {language.label}
                    </span>
                    {i18n.language === language.code && (
                      <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />
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
                  'flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200',
                  'hover:bg-gray-100',
                  showUserDropdown && 'bg-gray-50'
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
                  'absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] z-50',
                  'animate-fade-in',
                  isRTL ? 'left-0' : 'right-0'
                )}>
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={handleLockScreen}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                        'hover:bg-gray-50 text-gray-700',
                        isRTL ? 'flex-row-reverse' : ''
                      )}
                    >
                      <LockIcon className="h-4 w-4 text-gray-500" />
                      <span className={cn('flex-1', isRTL ? 'text-right' : 'text-left')}>
                        Lock Screen
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                        'hover:bg-red-50 text-red-600 hover:text-red-700',
                        isRTL ? 'flex-row-reverse' : ''
                      )}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className={cn('flex-1', isRTL ? 'text-right' : 'text-left')}>
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

