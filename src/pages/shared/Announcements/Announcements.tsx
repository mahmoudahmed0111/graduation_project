import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IAnnouncement } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  Bell, 
  Globe,
  Building2,
  Users,
  BookOpen,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { Input } from '@/components/ui/Input';
import { scopeIcons, scopeColors } from '@/constants/ui';
import { logger } from '@/lib/logger';
import { formatTimeAgo } from '@/utils/formatters';

export function Announcements() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { error: showError } = useToastStore();
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await api.getMyAnnouncements();
        const announcementsArray = Array.isArray(data) ? data : [];
        setAnnouncements(announcementsArray);
      } catch (error) {
        logger.error('Failed to fetch announcements', {
          context: 'Announcements',
          error,
        });
        showError('Failed to load announcements');
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesScope = selectedScope === 'all' || 
      announcement.scope.level === selectedScope;
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesScope && matchesSearch;
  });

  // Sort by date (most recent first)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.announcements')}</h1>
        <p className="text-gray-600 mt-1">Stay updated with university news and course announcements</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Announcements</option>
              <option value="Global">Global</option>
              <option value="College">College</option>
              <option value="Department">Department</option>
              <option value="Course">Course</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      {sortedAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No announcements found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement) => {
            const ScopeIcon = scopeIcons[announcement.scope.level];
            const scopeColor = scopeColors[announcement.scope.level];
            
            return (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${scopeColor}`}>
                          <ScopeIcon className="h-4 w-4" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${scopeColor}`}>
                          {announcement.scope.level}
                        </span>
                      </div>
                      <CardTitle className="text-lg mb-1">{announcement.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatTimeAgo(announcement.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>By {announcement.author.name}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      {sortedAnnouncements.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {sortedAnnouncements.length} of {announcements.length} announcement(s)
        </div>
      )}
    </div>
  );
}

