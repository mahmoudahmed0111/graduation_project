import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  X,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  BarChart3,
  FileText,
  ClipboardList,
  Clock,
  Bell,
  MessageSquare,
  User,
  Building2,
  School,
  UserCheck,
  Database,
  MapPin,
  Library,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Avatar } from '../ui/Avatar';

interface SidebarProps {
  isOpen: boolean;
  isExpanded?: boolean;
  onClose: () => void;
  onToggleExpand?: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export function Sidebar({ isOpen, isExpanded = true, onClose, onToggleExpand: _onToggleExpand }: SidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredItemPosition, setHoveredItemPosition] = useState<{ top: number; left: number } | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const isActive = (path: string) => location.pathname === path;

  const toggleItem = (path: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(path)) {
      newOpenItems.delete(path);
    } else {
      newOpenItems.add(path);
    }
    setOpenItems(newOpenItems);
  };

  const handleMouseEnter = (path: string, _event?: React.MouseEvent<HTMLDivElement>) => {
    if (!isExpanded) {
      // Clear any pending leave timeout
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }
      
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      hoverTimeoutRef.current = setTimeout(() => {
        const element = itemRefs.current.get(path);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHoveredItemPosition({
            top: rect.top,
            left: rect.right + 4,
          });
        }
        setHoveredItem(path);
      }, 100); // Reduced delay for faster response
    }
  };

  const handleMouseLeave = () => {
    // Clear any pending enter timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Add a small delay before hiding to allow moving to dropdown
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredItemPosition(null);
      leaveTimeoutRef.current = null;
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    // Clear leave timeout when entering dropdown
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    // Hide dropdown when leaving it
    setHoveredItem(null);
    setHoveredItemPosition(null);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const studentNavItems: NavItem[] = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { 
      path: '/dashboard/courses', 
      label: t('nav.courses'), 
      icon: BookOpen,
      children: [
        { path: '/dashboard/courses/all', label: t('nav.allCourses'), icon: BookOpen },
        { path: '/dashboard/courses/my-courses', label: t('nav.myCourses'), icon: BookOpen },
        { path: '/dashboard/courses/enroll', label: t('nav.enrollInCourse'), icon: BookOpen },
      ]
    },
    { path: '/dashboard/enrollments', label: t('nav.enrollments'), icon: GraduationCap },
    { path: '/dashboard/materials', label: t('nav.materials'), icon: FileText },
    { 
      path: '/dashboard/assessments', 
      label: t('nav.assessments'), 
      icon: ClipboardList,
      children: [
        { path: '/dashboard/assessments/my-assessments', label: t('nav.myAssessments'), icon: ClipboardList },
        { path: '/dashboard/assessments/submissions', label: t('nav.mySubmissions'), icon: FileText },
      ]
    },
    { path: '/dashboard/attendance', label: t('nav.attendance'), icon: Clock },
    { path: '/dashboard/announcements', label: t('nav.announcements'), icon: Bell },
    { path: '/dashboard/chatbot', label: t('nav.chatbot'), icon: MessageSquare },
    { path: '/dashboard/profile', label: t('nav.profile'), icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    ...(import.meta.env.DEV
      ? [{ path: '/dashboard/ui-preview', label: 'UI Preview (Static)', icon: LayoutDashboard } satisfies NavItem]
      : []),
    { 
      path: '/dashboard/organizational', 
      label: 'University Structure', 
      icon: Building2,
      children: [
        { path: '/dashboard/organizational/colleges', label: t('nav.colleges'), icon: Building2 },
        { path: '/dashboard/organizational/departments', label: t('nav.departments'), icon: School },
        { path: '/dashboard/organizational/locations', label: 'Locations', icon: MapPin },
      ]
    },
    { 
      path: '/dashboard/users', 
      label: 'User Management', 
      icon: Users,
      children: [
        { path: '/dashboard/users/students', label: t('nav.students'), icon: GraduationCap },
        { path: '/dashboard/users/doctors', label: t('nav.doctors'), icon: UserCheck },
        { path: '/dashboard/users/tas', label: t('nav.tas'), icon: Users },
        { path: '/dashboard/users/admins', label: t('nav.admins'), icon: User },
      ]
    },
    {
      path: '/dashboard/academic',
      label: 'Academic',
      icon: Library,
      children: [
        { path: '/dashboard/academic/catalog', label: 'Course catalog', icon: Library },
        { path: '/dashboard/academic/offerings', label: 'Course offerings', icon: BookOpen },
        { path: '/dashboard/academic/enrollments', label: 'Enrollments', icon: GraduationCap },
      ],
    },
    { path: '/dashboard/system-settings', label: 'System Settings', icon: Database },
    { path: '/dashboard/announcements', label: 'Broadcast Center', icon: Bell },
    { path: '/dashboard/chatbot', label: 'AI Assistant', icon: MessageSquare },
    { path: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
    { path: '/dashboard/profile', label: t('nav.profile'), icon: User },
  ];

  const doctorNavItems: NavItem[] = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/dashboard/roster', label: t('nav.roster'), icon: Users },
    { 
      path: '/dashboard/courses', 
      label: t('nav.courses'), 
      icon: BookOpen,
      children: [
        { path: '/dashboard/courses/my-courses', label: t('nav.myCourses'), icon: BookOpen },
      ]
    },
    { 
      path: '/dashboard/materials', 
      label: t('nav.materials'), 
      icon: FileText,
      children: [
        { path: '/dashboard/materials', label: t('nav.viewMaterials'), icon: FileText },
        { path: '/dashboard/materials/manage', label: t('nav.manageMaterials'), icon: FileText },
        { path: '/dashboard/materials/upload', label: t('nav.uploadMaterial'), icon: FileText },
      ]
    },
    { 
      path: '/dashboard/assessments', 
      label: t('nav.assessments'), 
      icon: ClipboardList,
      children: [
        { path: '/dashboard/assessments/my-assessments', label: t('nav.myAssessments'), icon: ClipboardList },
        { path: '/dashboard/assessments/create', label: t('nav.createAssessment'), icon: ClipboardList },
        { path: '/dashboard/assessments/grade', label: t('nav.gradeSubmissions'), icon: ClipboardList },
      ]
    },
    { 
      path: '/dashboard/attendance', 
      label: t('nav.attendance'), 
      icon: Clock,
      children: [
        { path: '/dashboard/attendance', label: t('nav.attendanceReports'), icon: Clock },
        { path: '/dashboard/attendance/sessions', label: t('nav.manageSessions'), icon: UserCheck },
      ]
    },
    { path: '/dashboard/grades', label: t('nav.calculateFinalGrades'), icon: GraduationCap },
    { path: '/dashboard/announcements', label: t('nav.announcements'), icon: Bell },
    { path: '/dashboard/chatbot', label: t('nav.chatbot'), icon: MessageSquare },
    { path: '/dashboard/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { path: '/dashboard/organizational/locations', label: 'Locations', icon: MapPin },
    { path: '/dashboard/profile', label: t('nav.profile'), icon: User },
  ];

  const navItems: NavItem[] = 
    user?.role === 'student' ? studentNavItems :
    user?.role === 'doctor' ? doctorNavItems :
    user?.role === 'universityAdmin' || user?.role === 'collegeAdmin' ? adminNavItems :
    adminNavItems;

  const renderNavItem = (item: NavItem, level: number = 0, parentPath?: string) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.has(item.path);
    const active = isActive(item.path);
    return (
      <div 
        key={item.path} 
        ref={(el) => {
          if (el) {
            itemRefs.current.set(item.path, el);
          } else {
            itemRefs.current.delete(item.path);
          }
        }}
        className="w-full relative"
        onMouseEnter={(e) => handleMouseEnter(parentPath || item.path, e)}
        onMouseLeave={handleMouseLeave}
      >
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleItem(item.path)}
              className={cn(
                'group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative',
                active
                  ? 'bg-gradient-to-r from-primary-50 to-accent-50/40 text-primary-800 font-semibold shadow-sm dark:from-primary-900/40 dark:to-accent-500/10 dark:text-accent-300'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-primary-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-accent-400',
                !isExpanded && 'lg:justify-center',
                level > 0 && 'ml-3 text-[13px]'
              )}
              title={!isExpanded ? item.label : undefined}
            >
              {active && isExpanded && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-accent-500 rounded-r-full" />
              )}
              <item.icon className={cn(
                'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                active ? 'text-primary-700 dark:text-accent-400' : 'text-slate-500 group-hover:text-primary-600 dark:text-slate-400 dark:group-hover:text-accent-400'
              )} />
              {isExpanded && (
                <>
                  <span className={cn(
                    'flex-1 text-left transition-opacity duration-300 ease-in-out whitespace-nowrap text-sm',
                  )}>
                    {item.label}
                  </span>
                  <div className="transition-transform duration-300 ease-in-out">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                </>
              )}
            </button>
            <div 
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                isOpen && isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
              )}
            >
              <div className="space-y-1">
                {item.children?.map((child, index) => (
                  <div
                    key={child.path}
                    className={cn(
                      'transition-all duration-200 ease-out',
                      isOpen && isExpanded 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-2'
                    )}
                    style={{
                      transitionDelay: isOpen && isExpanded ? `${index * 30}ms` : '0ms'
                    }}
                  >
                    {renderNavItem(child, level + 1, item.path)}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Link
            to={item.path}
            onClick={onClose}
            className={cn(
              'group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative',
              active
                ? 'bg-gradient-to-r from-primary-50 to-accent-50/40 text-primary-800 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-primary-700',
              !isExpanded && 'lg:justify-center',
              level > 0 && 'ml-3 text-[13px]'
            )}
            title={!isExpanded ? item.label : undefined}
          >
            {active && isExpanded && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-accent-500 rounded-r-full" />
            )}
            <item.icon className={cn(
              'h-[18px] w-[18px] flex-shrink-0 transition-colors',
              active ? 'text-primary-700' : 'text-slate-500 group-hover:text-primary-600'
            )} />
            {isExpanded && (
              <span className="flex-1 text-left transition-opacity duration-300 ease-in-out text-sm whitespace-nowrap">
                {item.label}
              </span>
            )}
          </Link>
        )}
      </div>
    );
  };

  // Find the hovered item to render its dropdown
  const hoveredNavItem = navItems.find(item => hoveredItem === item.path && item.children);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Hover menu portal - rendered outside sidebar */}
      {!isExpanded && hoveredNavItem && hoveredNavItem.children && hoveredItemPosition && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed pointer-events-auto"
          style={{ 
            zIndex: 99999,
            top: `${hoveredItemPosition.top}px`,
            left: `${hoveredItemPosition.left}px`,
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-lg shadow-2xl py-2 min-w-[220px] animate-fade-in overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60">
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <hoveredNavItem.icon className="h-4 w-4 text-primary-600 dark:text-accent-400" />
                <span className="text-left">{hoveredNavItem.label}</span>
              </p>
            </div>
                  <div className="py-1.5">
                    {hoveredNavItem.children.map((child) => {
                      const childActive = isActive(child.path);
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200',
                            childActive
                              ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-accent-400'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
                          )}
                        >
                          <child.icon className={cn(
                            'h-4 w-4 flex-shrink-0',
                            childActive ? 'text-primary-600 dark:text-accent-400' : 'text-gray-500 dark:text-slate-400'
                          )} />
                          <span className="flex-1">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 shadow-xl shadow-primary-900/5 dark:shadow-black/40',
          'bg-white dark:bg-slate-900 border-r border-slate-200/70 dark:border-slate-800',
          'transition-all duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isExpanded ? 'lg:w-64' : 'lg:w-16'
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ffd700 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }} />
            <div className="flex items-center gap-2.5 min-w-0 relative z-10">
              <div className="p-0.5 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 shadow-md flex-shrink-0">
                <div className="p-0.5 rounded-full bg-white">
                  <img
                    src="/logo/icon.png.png"
                    alt="Logo"
                    className="h-7 w-7 rounded-full"
                  />
                </div>
              </div>
              {isExpanded && (
                <div className="min-w-0 transition-opacity duration-300">
                  <p className="font-bold text-white text-sm leading-tight whitespace-nowrap">Beni-Suef</p>
                  <p className="text-[10px] text-accent-300 font-semibold tracking-wider uppercase">University</p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors relative z-10"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {isExpanded && (
              <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Menu</p>
            )}
            {navItems.map((item) => renderNavItem(item))}
          </nav>

          {/* User section */}
          {user && (
            <div className={cn(
              'p-3 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30',
              !isExpanded && 'lg:flex lg:flex-col lg:items-center'
            )}>
              <div className={cn(
                'flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors',
                !isExpanded && 'lg:flex-col lg:gap-1 lg:p-1'
              )}>
                <div className="ring-2 ring-accent-300 dark:ring-accent-500/60 rounded-full">
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    size="sm"
                  />
                </div>
                {isExpanded && (
                  <div className="flex-1 min-w-0 transition-opacity duration-300 ease-in-out">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate capitalize font-medium">
                      {user.role}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

