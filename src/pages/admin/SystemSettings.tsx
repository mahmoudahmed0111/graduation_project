import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { 
  Database, 
  Save,
  Calendar,
  Lock,
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { ISystemSettings } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function SystemSettings() {
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<ISystemSettings>({
    id: 'settings-1',
    currentSemester: 'Fall 2025',
    isEnrollmentOpen: false,
    gradePoints: {
      'A+': 4.0,
      'A': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'C+': 2.7,
      'C': 2.3,
      'D+': 2.0,
      'D': 1.7,
      'F': 0.0,
    },
    defaultCreditLimit: {
      good_standing: 18,
      probation: 12,
      honors: 21,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      // In real app: const data = await api.getSettings();
      // Using mock data for now
      setFetching(false);
    } catch (error) {
      logger.error('Failed to fetch settings', { context: 'SystemSettings', error });
      showError('Failed to load settings');
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // In real app: await api.updateSettings(settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('System settings updated successfully');
    } catch (error) {
      logger.error('Failed to update settings', { context: 'SystemSettings', error });
      showError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure global system parameters</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Current Semester */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Semester <span className="text-red-500">*</span>
                </label>
                <Input
                  value={settings.currentSemester}
                  onChange={(e) => setSettings({ ...settings, currentSemester: e.target.value })}
                  placeholder="e.g., Fall 2025"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enrollmentOpen"
                  checked={settings.isEnrollmentOpen}
                  onChange={(e) => setSettings({ ...settings, isEnrollmentOpen: e.target.checked })}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label htmlFor="enrollmentOpen" className="text-sm font-medium text-gray-700">
                  Enrollment Open
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Credit Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Credit Hour Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Good Standing Limit
                </label>
                <Input
                  type="number"
                  value={settings.defaultCreditLimit.good_standing}
                  onChange={(e) => setSettings({
                    ...settings,
                    defaultCreditLimit: {
                      ...settings.defaultCreditLimit,
                      good_standing: parseInt(e.target.value) || 0,
                    },
                  })}
                  min="0"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probation Limit
                </label>
                <Input
                  type="number"
                  value={settings.defaultCreditLimit.probation}
                  onChange={(e) => setSettings({
                    ...settings,
                    defaultCreditLimit: {
                      ...settings.defaultCreditLimit,
                      probation: parseInt(e.target.value) || 0,
                    },
                  })}
                  min="0"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Honors Limit
                </label>
                <Input
                  type="number"
                  value={settings.defaultCreditLimit.honors}
                  onChange={(e) => setSettings({
                    ...settings,
                    defaultCreditLimit: {
                      ...settings.defaultCreditLimit,
                      honors: parseInt(e.target.value) || 0,
                    },
                  })}
                  min="0"
                  max="30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Grade Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Grade Point Mapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(settings.gradePoints).map(([grade, points]) => (
                  <div key={grade}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {grade}
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={points}
                      onChange={(e) => setSettings({
                        ...settings,
                        gradePoints: {
                          ...settings.gradePoints,
                          [grade]: parseFloat(e.target.value) || 0,
                        },
                      })}
                      min="0"
                      max="4"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button type="submit" loading={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

