import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
            title: t('shared.notifications.mock1Title'),
            message: t('shared.notifications.mock1Message'),
            type: 'info',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/assessments/my-assessments',
          },
          {
            id: '2',
            title: t('shared.notifications.mock2Title'),
            message: t('shared.notifications.mock2Message'),
            type: 'success',
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/enrollments',
          },
          {
            id: '3',
            title: t('shared.notifications.mock3Title'),
            message: t('shared.notifications.mock3Message'),
            type: 'warning',
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/courses/enroll',
          },
          {
            id: '4',
            title: t('shared.notifications.mock4Title'),
            message: t('shared.notifications.mock4Message'),
            type: 'info',
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            link: '/dashboard/announcements',
          },
          {
            id: '5',
            title: t('shared.notifications.mock5Title'),
            message: t('shared.notifications.mock5Message'),
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
        showError(t('shared.notifications.failedLoad'));
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [showError, t]);

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
      success(t('shared.notifications.markedRead'));
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        context: 'Notifications',
        error,
      });
      showError(t('shared.notifications.failedUpdate'));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In real app: await api.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      success(t('shared.notifications.allMarkedRead'));
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        context: 'Notifications',
        error,
      });
      showError(t('shared.notifications.failedUpdateAll'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // In real app: await api.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id));
      success(t('shared.notifications.deleted'));
    } catch (error) {
      logger.error('Failed to delete notification', {
        context: 'Notifications',
        error,
      });
      showError(t('shared.notifications.failedDelete'));
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
          <p className="mt-4 text-gray-600">{t('shared.notifications.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('shared.notifications.title')}</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? t('shared.notifications.unreadCount', { count: unreadCount }) : t('shared.notifications.allCaughtUp')}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            {t('shared.notifications.markAllAsRead')}
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
          {t('shared.notifications.filterAll', { count: notifications.length })}
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          {t('shared.notifications.filterUnread', { count: unreadCount })}
        </Button>
        <Button
          variant={filter === 'read' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          {t('shared.notifications.filterRead', { count: notifications.length - unreadCount })}
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {filter === 'unread' ? t('shared.notifications.emptyUnread') :
                 filter === 'read' ? t('shared.notifications.emptyRead') :
                 t('shared.notifications.emptyAll')}
              </p>
              <p className="text-sm text-gray-500">
                {filter === 'unread' ? t('shared.notifications.allCaughtUp') :
                 t('shared.notifications.willAppear')}
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
                          {t('shared.notifications.viewDetails')}
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          {t('shared.notifications.markAsRead')}
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

