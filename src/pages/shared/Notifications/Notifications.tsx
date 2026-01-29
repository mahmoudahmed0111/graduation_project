import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { INotification } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Bell, 
  CheckCircle2,
  Info,
  AlertCircle,
  AlertTriangle,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { formatTimeAgo, formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export function Notifications() {
  useAuthStore();
  const { error: showError, success } = useToastStore();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // In real app: const data = await api.getNotifications()
        // For now, using mock data
        const mockNotifications: INotification[] = [
          {
            id: '1',
            title: 'New Assignment Posted',
            message: 'A new assignment has been posted for CS101 - Introduction to Programming. The assignment is due on March 15, 2024.',
            type: 'info',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/assessments/my-assessments',
          },
          {
            id: '2',
            title: 'Grade Updated',
            message: 'Your grade for Midterm Exam in CS201 - Data Structures has been updated. Check your transcript for details.',
            type: 'success',
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/enrollments',
          },
          {
            id: '3',
            title: 'Course Enrollment Reminder',
            message: 'Reminder: Course enrollment period ends in 3 days. Make sure to enroll in your required courses.',
            type: 'warning',
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/courses/enroll',
          },
          {
            id: '4',
            title: 'Announcement',
            message: 'New university announcement: Spring semester registration is now open.',
            type: 'info',
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/announcements',
          },
          {
            id: '5',
            title: 'Attendance Warning',
            message: 'Your attendance in CS301 is below 75%. Please attend classes regularly.',
            type: 'error',
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/attendance',
          },
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        logger.error('Failed to fetch notifications', {
          context: 'Notifications',
          error,
        });
        showError('Failed to load notifications');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [showError]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      // In real app: await api.markNotificationAsRead(id)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      success('Notification marked as read');
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        context: 'Notifications',
        error,
      });
      showError('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In real app: await api.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      success('All notifications marked as read');
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        context: 'Notifications',
        error,
      });
      showError('Failed to update notifications');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // In real app: await api.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id));
      success('Notification deleted');
    } catch (error) {
      logger.error('Failed to delete notification', {
        context: 'Notifications',
        error,
      });
      showError('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: INotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: INotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'read' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 
                 'No notifications'}
              </p>
              <p className="text-sm text-gray-500">
                {filter === 'unread' ? 'You\'re all caught up!' : 
                 'Notifications will appear here'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'transition-all hover:shadow-md',
                !notification.read && 'ring-2 ring-primary-200',
                getNotificationColor(notification.type)
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className={cn(
                          'text-base font-semibold text-gray-900 mb-1',
                          !notification.read && 'font-bold'
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)} • {formatDate(notification.createdAt, 'short')}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {notification.link && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (notification.link) {
                              window.location.href = notification.link;
                            }
                          }}
                        >
                          View Details
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

