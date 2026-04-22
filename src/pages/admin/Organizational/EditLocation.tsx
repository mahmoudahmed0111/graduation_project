import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { Save } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';
import { OrganizationalEditBreadcrumb } from '@/components/admin';
import { useInvalidateLocations } from '@/hooks/queries/useLocations';

const TYPE_OPTS = [
  { value: 'lecture_hall', label: 'Lecture hall' },
  { value: 'lab', label: 'Lab' },
  { value: 'section_room', label: 'Section room' },
  { value: 'auditorium', label: 'Auditorium' },
];

const FORM_ID = 'edit-location-form';

export function EditLocation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invalidateLocations = useInvalidateLocations();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collegeLabel, setCollegeLabel] = useState('');
  const [form, setForm] = useState({
    name: '',
    capacity: '',
    type: 'lecture_hall' as 'lecture_hall' | 'lab' | 'section_room' | 'auditorium',
    building: '',
    floor: '',
    roomNumber: '',
    readerId: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const raw = await api.getLocation(id);
        const r = raw as Record<string, unknown>;
        const rawCollege = r.college_id;
        if (typeof rawCollege === 'string' && rawCollege.trim()) {
          setCollegeLabel(rawCollege.trim());
        } else if (rawCollege && typeof rawCollege === 'object') {
          const c = rawCollege as Record<string, unknown>;
          const cn = String(c.name ?? '');
          const cc = String(c.code ?? '');
          setCollegeLabel(cc ? `${cn} (${cc})` : cn || '—');
        } else {
          setCollegeLabel('—');
        }
        setForm({
          name: String(r.name ?? ''),
          capacity: String(r.capacity ?? ''),
          type: String(r.type ?? 'lecture_hall') as typeof form.type,
          building: typeof r.building === 'string' ? r.building : '',
          floor: typeof r.floor === 'number' ? String(r.floor) : '',
          roomNumber: typeof r.roomNumber === 'string' ? r.roomNumber : '',
          readerId: typeof r.readerId === 'string' ? r.readerId : '',
        });
      } catch (error) {
        logger.error('Failed to load location', { context: 'EditLocation', error });
        showError('Could not load location');
        navigate('/dashboard/organizational/locations');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const cap = Number(form.capacity);
    if (!form.name.trim() || !Number.isFinite(cap) || cap < 0) {
      showError('Name and valid capacity are required');
      return;
    }
    try {
      setSaving(true);
      await api.updateLocation(id, {
        name: form.name.trim(),
        capacity: cap,
        type: form.type,
        ...(form.building.trim() ? { building: form.building.trim() } : {}),
        ...(form.floor.trim() !== '' && !Number.isNaN(Number(form.floor))
          ? { floor: Number(form.floor) }
          : {}),
        ...(form.roomNumber.trim() ? { roomNumber: form.roomNumber.trim() } : {}),
        ...(form.readerId.trim() ? { readerId: form.readerId.trim() } : {}),
      });
      success('Location updated');
      invalidateLocations();
      navigate('/dashboard/organizational/locations');
    } catch (error) {
      logger.error('Failed to update location', { context: 'EditLocation', error });
      showError(getApiErrorMessage(error, 'Failed to update location'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !id) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrganizationalEditBreadcrumb
        segments={[
          { label: 'University Structure' },
          { label: 'Locations', href: '/dashboard/organizational/locations' },
          { label: form.name.trim() || 'Location' },
          { label: 'Edit' },
        ]}
      />

      <Card>
        <CardContent className="py-4">
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">College</label>
              <Input value={collegeLabel} readOnly className="bg-gray-50 text-gray-700 dark:bg-slate-800/50 dark:text-gray-300" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity *</label>
                <Input
                  type="number"
                  min={0}
                  value={form.capacity}
                  onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
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
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Building</label>
                <Input
                  value={form.building}
                  onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Floor</label>
                <Input
                  type="number"
                  value={form.floor}
                  onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))}
                />
              </div>
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Room number</label>
                <Input
                  value={form.roomNumber}
                  onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reader ID</label>
                <Input
                  value={form.readerId}
                  onChange={(e) => setForm((p) => ({ ...p, readerId: e.target.value }))}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Link to="/dashboard/organizational/locations">
          <Button type="button" variant="secondary" className="rounded-xl">
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          form={FORM_ID}
          isLoading={saving}
          className="inline-flex items-center gap-2 rounded-xl"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
