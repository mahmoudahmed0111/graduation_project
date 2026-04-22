import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { MapPin, ArrowLeft, Save } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useColleges } from '@/hooks/queries/useColleges';
import { useInvalidateLocations } from '@/hooks/queries/useLocations';

const TYPE_OPTS = [
  { value: 'lecture_hall', label: 'Lecture hall' },
  { value: 'lab', label: 'Lab' },
  { value: 'section_room', label: 'Section room' },
  { value: 'auditorium', label: 'Auditorium' },
];

export function CreateLocation() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const invalidateLocations = useInvalidateLocations();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    collegeId: '',
    capacity: '',
    type: 'lecture_hall' as 'lecture_hall' | 'lab' | 'section_room' | 'auditorium',
    building: '',
    floor: '',
    roomNumber: '',
    readerId: '',
  });

  const isUa = user?.role === 'universityAdmin';

  const {
    data: collegesData,
    isLoading: collegesLoading,
    isError: collegesError,
    refetch: refetchColleges,
  } = useColleges(
    { page: 1, limit: 100, sort: 'name', isArchived: 'false' },
    { enabled: isUa }
  );

  const colleges = useMemo(() => {
    const items = collegesData?.items ?? [];
    return items.map((c) => {
      const r = c as Record<string, unknown>;
      return { id: String(r._id ?? r.id ?? ''), name: String(r.name ?? '') };
    });
  }, [collegesData?.items]);

  useEffect(() => {
    if (user?.role === 'collegeAdmin' && user.collegeId) {
      setForm((prev) => ({ ...prev, collegeId: user.collegeId! }));
    }
  }, [user?.role, user?.collegeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cap = Number(form.capacity);
    if (!form.name.trim() || !Number.isFinite(cap) || cap < 0) {
      showError('Name and valid capacity are required');
      return;
    }
    if (isUa && !form.collegeId.trim()) {
      showError('Select a college');
      return;
    }
    if (!isUa && !user?.collegeId) {
      showError('College could not be determined for your account');
      return;
    }
    try {
      setLoading(true);
      await api.createLocation({
        name: form.name.trim(),
        ...(isUa ? { college_id: form.collegeId.trim() } : {}),
        capacity: cap,
        type: form.type,
        ...(form.building.trim() ? { building: form.building.trim() } : {}),
        ...(form.floor.trim() !== '' && !Number.isNaN(Number(form.floor))
          ? { floor: Number(form.floor) }
          : {}),
        ...(form.roomNumber.trim() ? { roomNumber: form.roomNumber.trim() } : {}),
        ...(form.readerId.trim() ? { readerId: form.readerId.trim() } : {}),
      });
      success('Location created');
      invalidateLocations();
      navigate('/dashboard/organizational/locations');
    } catch (error) {
      logger.error('Failed to create location', { context: 'CreateLocation', error });
      showError(getApiErrorMessage(error, 'Failed to create location'));
    } finally {
      setLoading(false);
    }
  };

  if (isUa && collegesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500 dark:border-accent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading colleges…</p>
        </div>
      </div>
    );
  }

  if (isUa && collegesError && !collegesLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/organizational/locations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add location</h1>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">Could not load colleges</p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetchColleges()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/organizational/locations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add location</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isUa && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">College *</label>
                <Select2
                  value={form.collegeId}
                  onChange={(v) => setForm((p) => ({ ...p, collegeId: v }))}
                  options={[{ value: '', label: 'Select…' }, ...colleges.map((c) => ({ value: c.id, label: c.name }))]}
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity *</label>
                <Input
                  type="number"
                  min={0}
                  value={form.capacity}
                  onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type *</label>
                <Select2
                  value={form.type}
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      type: v as typeof form.type,
                    }))
                  }
                  options={TYPE_OPTS}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Building</label>
                <Input
                  value={form.building}
                  onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Floor</label>
                <Input
                  type="number"
                  value={form.floor}
                  onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Room number</label>
                <Input
                  value={form.roomNumber}
                  onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reader ID</label>
                <Input
                  value={form.readerId}
                  onChange={(e) => setForm((p) => ({ ...p, readerId: e.target.value }))}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || (isUa && colleges.length === 0)}
              className="w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving…' : 'Create'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
