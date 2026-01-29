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
  Library,
  Calendar,
  Database
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
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
          if (isRTL) {
            // In RTL, calculate from right side
            setHoveredItemPosition({
              top: rect.top,
              left: rect.left - 4, // Will be converted to right in style
            });
          } else {
            // In LTR, calculate from left side
            setHoveredItemPosition({
              top: rect.top,
              left: rect.right + 4,
            });
          }
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
    { 
      path: '/dashboard/users', 
      label: t('nav.users'), 
      icon: Users,
      children: [
        { path: '/dashboard/users/students', label: t('nav.students'), icon: GraduationCap },
        { path: '/dashboard/users/doctors', label: t('nav.doctors'), icon: UserCheck },
        { path: '/dashboard/users/tas', label: t('nav.tas'), icon: Users },
        { path: '/dashboard/users/admins', label: t('nav.admins'), icon: User },
      ]
    },
    { 
      path: '/dashboard/organizational', 
      label: t('nav.organizationalStructure'), 
      icon: Building2,
      children: [
        { path: '/dashboard/organizational/colleges', label: t('nav.colleges'), icon: Building2 },
        { path: '/dashboard/organizational/departments', label: t('nav.departments'), icon: School },
      ]
    },
    { 
      path: '/dashboard/academic', 
      label: t('nav.academicStructure'), 
      icon: BookOpen,
      children: [
        { path: '/dashboard/academic/catalog', label: t('nav.courseCatalog'), icon: Library },
        { path: '/dashboard/academic/offerings', label: t('nav.courseOfferings'), icon: Calendar },
      ]
    },
    { path: '/dashboard/enrollments', label: t('nav.enrollments'), icon: GraduationCap },
    { path: '/dashboard/announcements', label: t('nav.announcements'), icon: Bell },
    { path: '/dashboard/chatbot', label: t('nav.chatbot'), icon: MessageSquare },
    { path: '/dashboard/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { path: '/dashboard/system-settings', label: t('nav.systemSettings'), icon: Database },
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
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative',
                isRTL ? 'flex-row-reverse' : '',
                active
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100',
                !isExpanded && 'lg:justify-center',
                level > 0 && (isRTL ? 'mr-4' : 'ml-4')
              )}
              title={!isExpanded ? item.label : undefined}
            >
              {isRTL ? (
                <>
                  {isExpanded && (
                    <>
                      <div className="transition-transform duration-300 ease-in-out">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 transition-all duration-300 ease-in-out" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0 transition-all duration-300 ease-in-out" />
                        )}
                      </div>
                      <span className="flex-1 text-right transition-opacity duration-300 ease-in-out">
                        {item.label}
                      </span>
                    </>
                  )}
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                </>
              ) : (
                <>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && (
                    <>
                      <span className="flex-1 text-left transition-opacity duration-300 ease-in-out">
                        {item.label}
                      </span>
                      <div className="transition-transform duration-300 ease-in-out">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 transition-all duration-300 ease-in-out" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0 transition-all duration-300 ease-in-out" />
                        )}
                      </div>
                    </>
                  )}
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
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isRTL ? 'flex-row-reverse' : '',
              active
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100',
              !isExpanded && 'lg:justify-center',
              level > 0 && (isRTL ? 'mr-4' : 'ml-4')
            )}
            title={!isExpanded ? item.label : undefined}
          >
            {isRTL ? (
              <>
                {isExpanded && (
                  <span className="flex-1 text-right transition-opacity duration-300 ease-in-out">
                    {item.label}
                  </span>
                )}
                <item.icon className="h-5 w-5 flex-shrink-0" />
              </>
            ) : (
              <>
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="flex-1 text-left transition-opacity duration-300 ease-in-out">
                    {item.label}
                  </span>
                )}
              </>
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
            ...(isRTL 
              ? { right: `${window.innerWidth - hoveredItemPosition.left}px` }
              : { left: `${hoveredItemPosition.left}px` }
            ),
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="bg-white rounded-lg shadow-2xl py-2 min-w-[220px] animate-fade-in overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50">
              <p className={cn(
                'text-sm font-semibold text-gray-900 flex items-center gap-2',
                isRTL ? 'flex-row-reverse' : ''
              )}>
                <hoveredNavItem.icon className="h-4 w-4 text-primary-600" />
                <span className={isRTL ? 'text-right' : 'text-left'}>{hoveredNavItem.label}</span>
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
                            isRTL ? 'flex-row-reverse' : '',
                            childActive
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          {isRTL ? (
                            <>
                              <span className={cn('flex-1', isRTL ? 'text-right' : 'text-left')}>{child.label}</span>
                              <child.icon className={cn(
                                'h-4 w-4 flex-shrink-0',
                                childActive ? 'text-primary-600' : 'text-gray-500'
                              )} />
                            </>
                          ) : (
                            <>
                              <child.icon className={cn(
                                'h-4 w-4 flex-shrink-0',
                                childActive ? 'text-primary-600' : 'text-gray-500'
                              )} />
                              <span className="flex-1">{child.label}</span>
                            </>
                          )}
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
          'fixed top-0 h-full bg-white z-50',
          'transition-all duration-300 ease-in-out',
          isRTL 
            ? 'right-0 lg:translate-x-0' 
            : 'left-0 lg:translate-x-0',
          isRTL
            ? (isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
            : (isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'),
          isExpanded ? 'lg:w-64' : 'lg:w-16'
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 h-16">
            <div className="flex items-center gap-2 min-w-0">
              <img 
                src="/logo/icon.png.png" 
                alt="Logo" 
                className="h-8 w-8 flex-shrink-0"
              />
              {isExpanded && (
                <span className="font-semibold text-primary-600 whitespace-nowrap transition-opacity duration-300 ease-in-out">
                  {i18n.language === 'ar' ? 'جامعة بني سويف' : 'Beni Suef University'}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => renderNavItem(item))}
          </nav>

          {/* User section */}
          {user && (
            <div className={cn(
              'p-4',
              !isExpanded && 'lg:flex lg:flex-col lg:items-center'
            )}>
              <div className={cn(
                'flex items-center gap-3',
                !isExpanded && 'lg:flex-col'
              )}>
                <Avatar
                  src={user.avatarUrl}
                  name={user.name}
                  size="sm"
                />
                {isExpanded && (
                  <div className="flex-1 min-w-0 transition-opacity duration-300 ease-in-out">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
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

